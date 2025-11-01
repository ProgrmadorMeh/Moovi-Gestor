'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  // Render nothing while the redirect is happening
  return null;
}
