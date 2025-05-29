import { NextRequest, NextResponse } from 'next/server';

// Các route cần authentication
const protectedRoutes = ['/admin', '/profile', '/booking'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and API routes (except auth)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') ||
        (pathname.startsWith('/api') && !pathname.startsWith('/api/admin'))
    ) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    const hasToken = !!token;

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Redirect to login if accessing protected route without token
    if (isProtectedRoute && !hasToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login/register pages
    if ((pathname === '/login' || pathname === '/register') && hasToken) {
        // Let the AuthContext handle the redirect based on user role
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
