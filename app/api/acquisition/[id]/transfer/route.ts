// file: app/api/acquisition/[id]/transfer/route.ts

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

        const { newOwnerId, txHash } = await req.json()

        const existing = await prisma.acquisitionRequest.findUnique({
            where: { id: params.id }
        })

        if (!existing || existing.status !== 'APPROVED') {
            return NextResponse.json({ error: 'Must be approved first' }, { status: 400 })
        }

        const acquisition = await prisma.acquisitionRequest.update({
            where: { id: params.id },
            data: { status: 'COMPLETED' }
        })

        await prisma.land.update({
            where: { id: acquisition.landId },
            data: {
                status: 'ACQUIRED',
                ownerId: newOwnerId
            }
        })

        await prisma.acquisitionTimeline.create({
            data: {
                acquisitionRequestId: params.id,
                action: 'TRANSFERRED',
                txHash
            }
        })

        return NextResponse.json(acquisition)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to transfer' }, { status: 500 })
    }
}