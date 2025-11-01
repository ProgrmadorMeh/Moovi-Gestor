import { supabase } from "@/lib/supabaseClient.js";

export async function loginWithEmail(email, password) {
  try {
    // Paso 1: Autenticación con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    const user = data.user;

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

    if (userData.role !== "admin") {
      await supabase.auth.signOut();
      return {
        success: false,
        message: "No tienes permisos para acceder como cliente.",
      };
    }

    // Todo correcto
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
