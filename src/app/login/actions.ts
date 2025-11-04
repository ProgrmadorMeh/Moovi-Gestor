'use server'
 
import { createServerClient } from '@/lib/supabaseServer'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
 
export async function login(formData: any) {
  const cookieStore = cookies()
  const supabase = createServerClient()
 
  // type-safe server validation
  const { email, password } = formData;
 
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
 
  if (authError) {
    return { success: false, message: authError.message }
  }

  const user = authData.user;

  if (!user) {
    return { success: false, message: 'Authentication failed: no user returned.' };
  }
 
  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("id, role, name")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Tu cuenta no está registrada en el sistema.",
    };
  }

  // Admin and Vendedor roles are allowed
  if (userData.role !== "admin" && userData.role !== "vendedor") {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "No tienes permisos para acceder.",
    };
  }
 
  return { success: true }
}