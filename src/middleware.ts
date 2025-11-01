import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Si no hay sesión y el usuario intenta acceder a una ruta protegida (que no sea login, register, etc.)
  if (!session && !['/login', '/register', '/reset-password'].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si hay sesión y el usuario intenta acceder a login, register o la raíz, lo redirigimos al dashboard
  if (session && ['/login', '/register', '/reset-password', '/'].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // This matcher ensures that the middleware runs on all routes except for Next.js internals and assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
