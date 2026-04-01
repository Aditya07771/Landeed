// file: app/api/lands/[id]/register-onchain/route.ts

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

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { txHash, docHash } = await req.json()

        if (!txHash) {
            return NextResponse.json({ error: 'Missing txHash' }, { status: 400 })
        }

        const land = await prisma.land.findUnique({
            where: { id: params.id }
        })

        if (!land) {
            return NextResponse.json({ error: 'Land not found' }, { status: 404 })
        }

        if (land.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Not owner' }, { status: 403 })
        }

        const updated = await prisma.land.update({
            where: { id: params.id },
            data: {
                txHash,
                docHash: docHash || null
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}