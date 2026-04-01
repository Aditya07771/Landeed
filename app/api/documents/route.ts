// file: app/api/documents/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PINATA_JWT = process.env.PINATA_JWT || ''

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File
        const landId = formData.get('landId') as string
        const docType = formData.get('type') as string
        const hash = formData.get('hash') as string

        if (!file || !landId || !docType || !hash) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify land exists
        const land = await prisma.land.findUnique({ where: { id: landId } })
        if (!land) {
            return NextResponse.json({ error: 'Land not found' }, { status: 404 })
        }

        // Upload to Pinata
        const pinataFormData = new FormData()
        pinataFormData.append('file', file)

        const metadata = JSON.stringify({
            name: file.name,
            keyvalues: {
                landId: land.landId,
                type: docType,
                uploadedBy: session.user.id
            }
        })
        pinataFormData.append('pinataMetadata', metadata)

        const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`
            },
            body: pinataFormData
        })

        if (!pinataRes.ok) {
            const error = await pinataRes.text()
            return NextResponse.json({ error: `Pinata error: ${error}` }, { status: 500 })
        }

        const pinataData = await pinataRes.json()

        // Save to database
        const document = await prisma.document.create({
            data: {
                landId,
                type: docType,
                fileName: file.name,
                ipfsCid: pinataData.IpfsHash,
                hash
            }
        })

        return NextResponse.json({
            id: document.id,
            cid: pinataData.IpfsHash,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`,
            hash: document.hash
        }, { status: 201 })

    } catch (error) {
        console.error('Document upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const landId = searchParams.get('landId')

        if (!landId) {
            return NextResponse.json({ error: 'landId required' }, { status: 400 })
        }

        const documents = await prisma.document.findMany({
            where: { landId },
            orderBy: { createdAt: 'desc' }
        })

        const docsWithUrls = documents.map(doc => ({
            ...doc,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${doc.ipfsCid}`
        }))

        return NextResponse.json(docsWithUrls)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }
}