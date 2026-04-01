// file: app/api/documents/verify-hash/route.ts

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

        const { documentId, hash } = await req.json()

        if (!documentId || !hash) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const document = await prisma.document.findUnique({
            where: { id: documentId }
        })

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        const isValid = document.hash.toLowerCase() === hash.toLowerCase()

        return NextResponse.json({
            valid: isValid,
            originalHash: document.hash,
            providedHash: hash
        })
    } catch (error) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
}