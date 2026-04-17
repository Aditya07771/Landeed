import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const unreadOnly = searchParams.get('unread') === 'true'

        const where: any = { userId: session.user.id }
        if (unreadOnly) {
            where.isRead = false
        }

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.notification.count({
                where: { userId: session.user.id, isRead: false }
            })
        ])

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error('Fetch notifications error:', error)
        return NextResponse.json({ error: 'Failed to fetch notifications', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { notificationIds } = await req.json()

        if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
            return NextResponse.json({ error: 'Missing or invalid notificationIds array', code: 'VALIDATION_ERROR' }, { status: 400 })
        }

        await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId: session.user.id
            },
            data: {
                isRead: true
            }
        })

        return NextResponse.json({ success: true, code: 'SUCCESS' })
    } catch (error) {
        console.error('Update notifications error:', error)
        return NextResponse.json({ error: 'Failed to update notifications', code: 'SERVER_ERROR', details: error }, { status: 500 })
    }
}
