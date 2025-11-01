import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  
  // The redirection logic has been removed as requested to stop the redirect loop.
  // The middleware will no longer redirect users to the login page.

  return response;
}

export const config = {
  // This matcher ensures that the middleware runs on all routes except for Next.js internals and assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
