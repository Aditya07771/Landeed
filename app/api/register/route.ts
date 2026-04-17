// file: app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role, aadharNumber, panNumber } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        const exists = await prisma.user.findUnique({ where: { email } })

        if (exists) {
            return NextResponse.json({ error: 'User exists', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        let aadharHash: string | null = null
        let panHash: string | null = null
        let isKycVerified = false
        let kycVerifiedAt: Date | null = null

        const assignedRole = (role as Role) || 'OWNER'

        // Only validate KYC for OWNER if both are provided
        if (assignedRole === 'OWNER' && aadharNumber && panNumber) {
            if (!/^\d{12}$/.test(aadharNumber)) {
                return NextResponse.json({ error: 'Aadhar must be exactly 12 digits', code: 'VALIDATION_ERROR' }, { status: 400 })
            }

            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
                return NextResponse.json({ error: 'PAN must match format ABCDE1234F', code: 'VALIDATION_ERROR' }, { status: 400 })
            }

            aadharHash = crypto.createHash('sha256').update(aadharNumber).digest('hex')
            panHash = crypto.createHash('sha256').update(panNumber).digest('hex')
            isKycVerified = true
            kycVerifiedAt = new Date()
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: assignedRole,
                aadharHash,
                panHash,
                isKycVerified,
                kycVerifiedAt
            }
        })

        if (isKycVerified) {
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'KYC_VERIFIED',
                    title: 'KYC Verified',
                    message: 'Your identity has been verified successfully during registration.'
                }
            })
        }

        return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
    } catch (error) {
        console.error('Registration failed:', error)
        return NextResponse.json({ error: 'Registration failed', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}