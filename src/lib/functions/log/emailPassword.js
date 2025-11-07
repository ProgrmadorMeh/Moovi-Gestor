import { supabase } from '../../supabaseClient';

/**
 * Envía un email para recuperar la contraseña.
 * @param {string} email - El email del usuario.
 * @returns {Promise<{ success: boolean, message: string, data: any | null }>}
 */
export async function emailPassword(email) {
  try {
    // Enviamos el email de recuperación
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      return {
        success: false,
        message: `Error al enviar el email de recuperación: ${error.message}`,
        data: null,
      };
    }

    return {
      success: true,
      message: "Email de recuperación enviado correctamente. Revisa tu bandeja de entrada.",
      data: data ?? null,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error inesperado: ${err.message}`,
      data: null,
    };
  }
}
