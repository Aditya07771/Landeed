// file: app/api/acquisition/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'AUTHORITY') {
            return NextResponse.json({ error: 'Only authority can request' }, { status: 403 })
        }

        const { landId, amount, txHash } = await req.json()

        const land = await prisma.land.findUnique({ where: { id: landId } })

        if (!land) {
            return NextResponse.json({ error: 'Land not found' }, { status: 404 })
        }

        if (land.status !== 'AVAILABLE') {
            return NextResponse.json({ error: 'Land not available' }, { status: 400 })
        }

        const acquisition = await prisma.acquisitionRequest.create({
            data: {
                landId,
                authorityId: session.user.id,
                amount: parseFloat(amount),
                txHash,
                status: 'PENDING'
            }
        })

        await prisma.land.update({
            where: { id: landId },
            data: { status: 'UNDER_ACQUISITION' }
        })

        await prisma.acquisitionTimeline.create({
            data: {
                acquisitionRequestId: acquisition.id,
                action: 'REQUESTED',
                txHash
            }
        })

        return NextResponse.json(acquisition, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const where: any = {}

        if (session.user.role === 'AUTHORITY') {
            where.authorityId = session.user.id
        } else if (session.user.role === 'VERIFIER') {
            where.OR = [{ assignedVerifierId: session.user.id }, { assignedVerifierId: null }]
        } else if (session.user.role === 'ADMIN') {
            // ADMIN sees all, no filter needed for ownership
        }

        if (status) {
            where.status = status
        }

        const acquisitions = await prisma.acquisitionRequest.findMany({
            where,
            include: {
                land: {
                    include: {
                        owner: { select: { id: true, name: true, walletAddress: true } }
                    }
                },
                authority: { select: { id: true, name: true } },
                verifier: { select: { id: true, name: true } },
                timeline: { orderBy: { createdAt: 'asc' } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(acquisitions)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}