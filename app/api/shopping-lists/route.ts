import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getExpectedAccessToken } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const sessionCookie = request.headers.get('cookie') ?? '';
  const hasAccess = sessionCookie
    .split(';')
    .map((part) => part.trim())
    .some((part) => part === `${AUTH_COOKIE_NAME}=${getExpectedAccessToken()}`);

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/login', request.url), 303);
  }

  const formData = await request.formData();
  const name = String(formData.get('title') ?? 'Ma future course').trim() || 'Ma future course';
  const productIds = formData
    .getAll('productIds')
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  const quantities = formData
    .getAll('productQuantities')
    .map((value) => Number(value))
    .map((value) => (Number.isInteger(value) && value > 0 ? value : 1));

  if (productIds.length === 0) {
    return NextResponse.redirect(new URL('/?error=empty', request.url), 303);
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.rpc('save_shopping_list', {
    p_name: name,
    p_product_ids: productIds,
    p_quantities: quantities.length === productIds.length ? quantities : productIds.map(() => 1)
  });

  if (error) {
    return NextResponse.redirect(new URL('/?error=1', request.url), 303);
  }

  return NextResponse.redirect(new URL('/?saved=1', request.url), 303);
}
