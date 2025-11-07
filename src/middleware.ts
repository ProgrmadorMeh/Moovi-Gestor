import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const publicRoutes = ['/login', '/register', '/reset-password', '/update-password'];

  // If no session, and trying to access a protected route
  if (!session && !publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If session exists, and trying to access a public route (except root which redirects)
  if (session && publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // If root, redirect to dashboard (whether logged in or not, auth guard will handle)
  if (pathname === '/') {
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
