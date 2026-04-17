// file: app/api/lands/[id]/route.ts (UPDATED)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateGeoJSON, normalizeToGeoJSON } from '@/lib/geojson'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const orConditions: any[] = [
            { id: params.id },
            { landId: params.id },
            { landId: `LAND-${params.id.replace(/^LAND-/, '')}` }
        ]

        const land = await prisma.land.findFirst({
            where: { OR: orConditions },
            include: {
                owner: { select: { id: true, name: true, email: true, walletAddress: true } },
                documents: true,
                histories: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                },
                acquisitionRequests: {
                    include: {
                        authority: { select: { id: true, name: true, walletAddress: true } },
                        verifier: { select: { id: true, name: true } },
                        timeline: { orderBy: { createdAt: 'asc' } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!land) {
            return NextResponse.json({ error: 'Land not found' }, { status: 404 })
        }

        return NextResponse.json(land)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch land' }, { status: 500 })
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()

        // Validate coordinates if provided
        if (data.coordinates) {
            if (!validateGeoJSON(data.coordinates)) {
                return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
            }
            data.coordinates = normalizeToGeoJSON(data.coordinates)
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)
        const orConditions: any[] = [
            { landId: params.id },
            { landId: `LAND-${params.id.replace(/^LAND-/, '')}` }
        ]
        if (isUUID) orConditions.push({ id: params.id })

        // First find the land to get the internal UUID if friendly ID was passed
        const existingLand = await prisma.land.findFirst({
            where: { OR: orConditions }
        })
        
        if (!existingLand) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const land = await prisma.land.update({
            where: { id: existingLand.id },
            data
        })

        return NextResponse.json(land)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update land' }, { status: 500 })
    }
}