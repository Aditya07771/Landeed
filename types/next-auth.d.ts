// file: types/next-auth.d.ts

import { Role } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
    interface User {
        id: string
        role: Role
        walletAddress?: string | null
    }
    interface Session {
        user: User & {
            id: string
            role: Role
            walletAddress?: string | null
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: Role
        walletAddress?: string | null
    }
}