// file: middleware.ts

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Role-based route protection
        if (path.startsWith('/authority') && token?.role !== 'AUTHORITY') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        if (path.startsWith('/verifier') && token?.role !== 'VERIFIER') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        if (path.startsWith('/owner') && token?.role !== 'OWNER') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
)

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/lands/:path*',
        '/authority/:path*',
        '/verifier/:path*',
        '/owner/:path*'
    ]
}