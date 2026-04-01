// file: app/api/acquisition/[id]/approve/route.ts

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

        const existing = await prisma.acquisitionRequest.findUnique({
            where: { id: params.id }
        })

        if (!existing || existing.status !== 'VERIFIED') {
            return NextResponse.json({ error: 'Must be verified first' }, { status: 400 })
        }

        const acquisition = await prisma.acquisitionRequest.update({
            where: { id: params.id },
            data: { status: 'APPROVED' }
        })

        await prisma.acquisitionTimeline.create({
            data: {
                acquisitionRequestId: params.id,
                action: 'APPROVED',
                txHash
            }
        })

        return NextResponse.json(acquisition)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
    }
}