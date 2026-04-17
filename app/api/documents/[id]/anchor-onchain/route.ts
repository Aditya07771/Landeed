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
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const documentId = params.id
        const { txHash } = await req.json()

        if (!txHash) {
            return NextResponse.json({ error: 'Missing txHash', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { land: true }
        })

        if (!document) {
            return NextResponse.json({ error: 'Document not found', code: 'NOT_FOUND' }, { status: 404 })
        }

        if (document.land.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Not the land owner', code: 'FORBIDDEN' }, { status: 403 })
        }

        const updatedDoc = await prisma.document.update({
            where: { id: documentId },
            data: {
                onChainTxHash: txHash,
                isOnChainVerified: true
            }
        })

        await prisma.landHistory.create({
            data: {
                landId: document.landId,
                action: 'DOCUMENT_ANCHORED',
                performedBy: session.user.id,
                metadata: {
                    ipfsCid: document.ipfsCid,
                    txHash: txHash,
                    documentId: document.id
                }
            }
        })

        return NextResponse.json(updatedDoc, { status: 200 })
    } catch (error) {
        console.error('Anchor on-chain error:', error)
        return NextResponse.json({ error: 'Failed to anchor document', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}
