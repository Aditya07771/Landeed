// file: app/api/acquisition/[id]/lock-funds/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'AUTHORITY') {
            return NextResponse.json({ error: 'Only authority allowed' }, { status: 403 })
        }

        const { txHash } = await req.json()

        const acquisition = await prisma.acquisitionRequest.findUnique({
            where: { id: params.id }
        })

        if (!acquisition) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        if (acquisition.status !== 'APPROVED') {
            return NextResponse.json({ error: 'Must be approved first' }, { status: 400 })
        }

        const updated = await prisma.acquisitionRequest.update({
            where: { id: params.id },
            data: { paymentStatus: 'LOCKED' }
        })

        await prisma.acquisitionTimeline.create({
            data: {
                acquisitionRequestId: params.id,
                action: 'PAYMENT_LOCKED',
                txHash
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to lock funds' }, { status: 500 })
    }
}