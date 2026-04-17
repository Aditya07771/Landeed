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
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)
        const orConditions: any[] = [
            { landId: params.id },
            { landId: `LAND-${params.id.replace(/^LAND-/, '')}` }
        ]
        if (isUUID) orConditions.push({ id: params.id })

        const existingLand = await prisma.land.findFirst({
            where: { OR: orConditions }
        })

        if (!existingLand) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const history = await prisma.landHistory.findMany({
            where: { landId: existingLand.id },
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        })

        return NextResponse.json(history)
    } catch (error) {
        console.error('Fetch land history error:', error)
        return NextResponse.json({ error: 'Failed to fetch land history', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}
