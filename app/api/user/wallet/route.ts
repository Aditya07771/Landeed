// file: app/api/user/wallet/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { walletAddress } = await req.json()

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { walletAddress }
        })

        return NextResponse.json({ walletAddress: user.walletAddress })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
    }
}