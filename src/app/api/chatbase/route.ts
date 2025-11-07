// src/app/api/chatbase/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const secret = process.env.CHATBASE_SECRET_KEY;

  if (!secret) {
    console.error('Chatbase secret key is not configured.');
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error: Chatbase not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('user')
    .select('name')
    .eq('id', session.user.id)
    .single();
  
  if (profileError) {
     console.error('Error fetching user profile for Chatbase:', profileError);
  }

  const token = jwt.sign(
    { 
        user_id: session.user.id,
        email: session.user.email,
        name: userProfile?.name || session.user.email, // Use name from profile, fallback to email
    }, 
    secret, 
    { expiresIn: '1h' }
  );

  return new NextResponse(JSON.stringify({ token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
