// file: app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, role } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const exists = await prisma.user.findUnique({ where: { email } })

        if (exists) {
            return NextResponse.json({ error: 'User exists' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: (role as Role) || 'OWNER'
            }
        })

        return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }
}