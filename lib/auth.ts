import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'shopping-list-session';

export function getExpectedAccessToken() {
  const token = process.env.APP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Missing APP_ACCESS_TOKEN');
  }

  return token;
}

export function getExpectedPassword() {
  const password = process.env.APP_ACCESS_PASSWORD;
  if (!password) {
    throw new Error('Missing APP_ACCESS_PASSWORD');
  }

  return password;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === getExpectedAccessToken();
}
