import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
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

        if (!user) {
            return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 })
        }

        return NextResponse.json(user, { status: 200 })
    } catch (error) {
        console.error('Failed to fetch user profile:', error)
        return NextResponse.json({ error: 'Internal server error', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}
