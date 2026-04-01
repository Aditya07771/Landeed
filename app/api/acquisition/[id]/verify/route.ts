// file: app/api/acquisition/[id]/verify/route.ts

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

        const { notes, txHash } = await req.json()

        const acquisition = await prisma.acquisitionRequest.update({
            where: { id: params.id },
            data: {
                status: 'VERIFIED',
                verifierId: session.user.id,
                verifierNote: notes
            }
        })

        await prisma.acquisitionTimeline.create({
            data: {
                acquisitionRequestId: params.id,
                action: 'VERIFIED',
                txHash
            }
        })

        return NextResponse.json(acquisition)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to verify' }, { status: 500 })
    }
}