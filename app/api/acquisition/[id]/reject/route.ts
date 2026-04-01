// file: app/api/acquisition/[id]/reject/route.ts

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

        if (!session || session.user.role !== 'VERIFIER') {
            return NextResponse.json({ error: 'Only verifier allowed' }, { status: 403 })
        }

        const { reason, txHash } = await req.json()

        const acquisition = await prisma.acquisitionRequest.update({
            where: { id: params.id },
            data: {
                status: 'REJECTED',
                verifierId: session.user.id,
                verifierNote: reason
            }
        })

        await prisma.land.update({
            where: { id: acquisition.landId },
            data: { status: 'AVAILABLE' }
        })

        await prisma.acquisitionTimeline.create({
            data: {
                acquisitionRequestId: params.id,
                action: 'REJECTED',
                txHash
            }
        })

        return NextResponse.json(acquisition)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reject' }, { status: 500 })
    }
}