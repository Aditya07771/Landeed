// file: app/api/lands/geojson/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GeoJSONFeatureCollection, normalizeToGeoJSON, buildPlaceholderPolygon } from '@/lib/geojson'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const where: any = {}

        if (status) {
            where.status = status
        }

        const lands = await prisma.land.findMany({
            where,
            include: {
                owner: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'asc' }
        })

        const features = lands.map((land, index) => {
            let geometry = normalizeToGeoJSON(land.coordinates)
            let geometryIsApproximate = false
            if (!geometry) {
                geometry = buildPlaceholderPolygon(land.landId, index, land.area)
                geometryIsApproximate = true
            }

            return {
                type: 'Feature' as const,
                properties: {
                    id: land.id,
                    landId: land.landId,
                    ownerId: land.ownerId,
                    ownerName: land.owner.name,
                    area: land.area,
                    location: land.location,
                    status: land.status,
                    txHash: land.txHash,
                    geometryIsApproximate
                },
                geometry
            }
        })

        const geojson: GeoJSONFeatureCollection = {
            type: 'FeatureCollection',
            features: features as any
        }

        return NextResponse.json(geojson)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}