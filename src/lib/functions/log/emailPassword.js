import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


/**
 * Envia un email para cambiar la contraseña.
 * @returns {Promise<{ success: boolean, message: string, data: any[] | null  }>}
 */
export async function emailPassword(email) {
  try{
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://Moovi.com/reset-password", // Direccion donde llevara el email
      })

  if (error) return {
    success: false,
    message: `Error al enviar el email de recuperacion: ${error.message}`,
    data: null,
  }

  return {
    success: true,
    message: "Email enviado correctamente",
    data: data ?? null,
  }
  } catch (err) {
    return {
    success: false,
    message: `Error inesperado: ${err.message}`,
    data: null,
  }
  }
}
