// file: app/api/documents/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const document = await prisma.document.findUnique({
            where: { id: params.id },
            include: {
                land: {
                    select: { id: true, landId: true, ownerId: true }
                }
            }
        })

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        return NextResponse.json({
            ...document,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${document.ipfsCid}`
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const document = await prisma.document.findUnique({
            where: { id: params.id },
            include: { land: true }
        })

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        if (document.land.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        await prisma.document.delete({ where: { id: params.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}