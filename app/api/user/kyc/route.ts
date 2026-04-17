import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { aadharNumber, panNumber } = await req.json()

        if (!aadharNumber || !panNumber) {
            return NextResponse.json({ error: 'Missing fields', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        // Aadhar validation: exactly 12 digits
        if (!/^\d{12}$/.test(aadharNumber)) {
            return NextResponse.json({ error: 'Aadhar must be exactly 12 digits', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        // PAN validation: exactly 10 chars matching pattern
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
            return NextResponse.json({ error: 'PAN must match format ABCDE1234F', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 })
        }

        if (user.isKycVerified) {
            return NextResponse.json({ error: 'User is already KYC verified', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        const aadharHash = crypto.createHash('sha256').update(aadharNumber).digest('hex')
        const panHash = crypto.createHash('sha256').update(panNumber).digest('hex')

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                aadharHash,
                panHash,
                isKycVerified: true,
                kycVerifiedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                walletAddress: true,
                isKycVerified: true,
                kycVerifiedAt: true
            }
        })

        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'KYC_VERIFIED',
                title: 'KYC Verified',
                message: 'Your identity has been verified successfully. Your future land registrations will be identity-linked.'
            }
        })

        return NextResponse.json(updatedUser, { status: 200 })
    } catch (error) {
        console.error('KYC verification error:', error)
        return NextResponse.json({ error: 'Internal server error', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}
