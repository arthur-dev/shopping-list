import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getExpectedAccessToken, getExpectedPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');

  if (!password || password !== getExpectedPassword()) {
    return NextResponse.redirect(new URL('/login?error=1', request.url), 303);
  }

  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.cookies.set(AUTH_COOKIE_NAME, getExpectedAccessToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
