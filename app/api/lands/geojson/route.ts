// file: app/api/lands/geojson/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GeoJSONFeatureCollection, normalizeToGeoJSON } from '@/lib/geojson'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const where: any = {
            coordinates: { not: null }
        }

        if (status) {
            where.status = status
        }

        const lands = await prisma.land.findMany({
            where,
            include: {
                owner: { select: { id: true, name: true } }
            }
        })

        const features = lands
            .map((land) => {
                const geometry = normalizeToGeoJSON(land.coordinates)
                if (!geometry) return null

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
                        txHash: land.txHash
                    },
                    geometry
                }
            })
            .filter(Boolean)

        const geojson: GeoJSONFeatureCollection = {
            type: 'FeatureCollection',
            features: features as any
        }

        return NextResponse.json(geojson)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}