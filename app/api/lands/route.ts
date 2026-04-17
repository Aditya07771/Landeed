// file: app/api/lands/route.ts

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
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        if (session.user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Only owners can register land', code: 'FORBIDDEN' }, { status: 403 })
        }

        const { area, location, coordinates } = await req.json()

        if (!area || !location) {
            return NextResponse.json({ error: 'Missing required fields', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        let normalizedCoords: any = undefined
        if (coordinates) {
            if (!validateGeoJSON(coordinates)) {
                return NextResponse.json({ error: 'Invalid GeoJSON coordinates', code: 'VALIDATION_ERROR' }, { status: 400 })
            }
            normalizedCoords = normalizeToGeoJSON(coordinates)
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found', code: 'NOT_FOUND' }, { status: 404 })
        }

        let landIdStr = ''
        let isKycLinked = false
        if (user.aadharHash) {
            const prefix = user.aadharHash.substring(0, 8).toUpperCase()
            const timestamp = (Date.now()).toString(36).toUpperCase()
            landIdStr = `LAND-${prefix}-${timestamp}`
            isKycLinked = true
        } else {
            landIdStr = `LAND-UNVERIFIED-${nanoid(8)}`
        }

        const land = await prisma.land.create({
            data: {
                landId: landIdStr,
                ownerId: session.user.id,
                area: parseFloat(area),
                location,
                coordinates: normalizedCoords,
                status: 'AVAILABLE'
            }
        })

        await prisma.landHistory.create({
            data: {
                landId: land.id,
                action: 'REGISTERED',
                performedBy: session.user.id,
                metadata: {
                    isKycLinked,
                    note: isKycLinked ? "Registered using verified identity" : "Registered without identity verification"
                }
            }
        })

        const authorities = await prisma.user.findMany({ where: { role: 'AUTHORITY' } })
        if (authorities.length > 0) {
            await prisma.notification.createMany({
                data: authorities.map(a => ({
                    userId: a.id,
                    type: 'LAND_REGISTERED',
                    title: 'New Land Registered',
                    message: `A new land parcel (${landIdStr}) has been registered and is available for acquisition.`,
                    landId: land.id
                }))
            })
        }

        return NextResponse.json({
            ...land,
            kycNote: isKycLinked ? undefined : "This land is not KYC-linked."
        }, { status: 201 })
    } catch (error) {
        console.error('Land registration error:', error)
        return NextResponse.json({ error: 'Failed to create land', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
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
        console.error('Fetch lands error:', error)
        return NextResponse.json({ error: 'Failed to fetch lands', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}