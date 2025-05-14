import { NextResponse } from 'next/server';

export function middleware(request) {
    if (request.nextUrl.pathname === '/signup') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (
        request.nextUrl.pathname === '/api/auth/signup' ||
        request.nextUrl.pathname === '/api/record-signup' ||
        request.nextUrl.pathname === '/api/update-total-signups'
    ) {
        return new NextResponse(JSON.stringify({ success: false, message: 'This endpoint is no longer available' }), {
            status: 404,
            headers: { 'content-type': 'application/json' },
        });
    }
}

export const config = {
    matcher: ['/signup', '/api/auth/signup', '/api/record-signup', '/api/update-total-signups'],
};
