import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response } = createClient(request);

  // The middleware is currently disabled to prevent redirect loops.
  // It can be re-enabled once the authentication flow is stable.

  // const { supabase } = createClient(request);
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // const { pathname } = request.nextUrl;

  // // If no session, and trying to access a protected route
  // if (!session && !['/login', '/register', '/reset-password'].includes(pathname)) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }

  // // If session exists, and trying to access login, register, or root, redirect to dashboard
  // if (session && ['/login', '/register', '/reset-password', '/'].includes(pathname)) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/dashboard';
  //   return NextResponse.redirect(url);
  // }

  return response;
}

export const config = {
  // This matcher ensures that the middleware runs on all routes except for Next.js internals and assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
