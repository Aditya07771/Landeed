// file: app/api/lands/route.ts (UPDATED)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { validateGeoJSON, normalizeToGeoJSON } from '@/lib/geojson'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Only owners can register land' }, { status: 403 })
        }

        const { area, location, coordinates } = await req.json()

        if (!area || !location) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let normalizedCoords: any = undefined
        if (coordinates) {
            if (!validateGeoJSON(coordinates)) {
                return NextResponse.json({ error: 'Invalid GeoJSON coordinates' }, { status: 400 })
            }
            normalizedCoords = normalizeToGeoJSON(coordinates)
        }

        const land = await prisma.land.create({
            data: {
                landId: `LAND-${nanoid(8)}`,
                ownerId: session.user.id,
                area: parseFloat(area),
                location,
                coordinates: normalizedCoords,
                status: 'AVAILABLE'
            }
        })

        return NextResponse.json(land, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create land' }, { status: 500 })
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
        const withCoordinates = searchParams.get('withCoordinates')

        const where: any = {}

        if (session.user.role === 'OWNER') {
            where.ownerId = session.user.id
        }

        if (status) {
            where.status = status
        }

        if (withCoordinates === 'true') {
            where.coordinates = { not: null }
        }

        const lands = await prisma.land.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, name: true, email: true, walletAddress: true }
                },
                acquisitionRequests: {
                    include: {
                        authority: { select: { id: true, name: true } },
                        timeline: { orderBy: { createdAt: 'asc' } }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(lands)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch lands' }, { status: 500 })
    }
}