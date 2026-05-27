import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getExpectedAccessToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/login', '/api/logout'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const expectedToken = getExpectedAccessToken();
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthenticated = token === expectedToken;

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

