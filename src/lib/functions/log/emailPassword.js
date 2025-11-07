import { supabase } from '../../supabaseClient';

/**
 * Envía un email para recuperar la contraseña.
 * @param {string} email - El email del usuario.
 * @returns {Promise<{ success: boolean, message: string, data: any | null }>}
 */
export async function emailPassword(email) {
  try {
    console.log("📧 Iniciando proceso de recuperación de contraseña para:", email);

    if (!email || typeof email !== "string") {
      console.error("❌ Email inválido o vacío.");
      return {
        success: false,
        message: "Debes proporcionar un email válido.",
        data: null,
      };
    }

    // 🔧 Importante: agregamos el '#' al final para forzar tokens en el hash
    const redirectUrl = `${window.location.origin}/update-password#type=recovery`;

    console.log("🔗 URL de redirección configurada con hash:", redirectUrl);

    // 📤 Enviamos la solicitud de recuperación a Supabase
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    console.log("📨 Respuesta de Supabase:", { data, error });

    if (error) {
      console.error("⚠️ Error al enviar email de recuperación:", error.message);
      return {
        success: false,
        message: `Error al enviar el email de recuperación: ${error.message}`,
        data: null,
      };
    }

    if (!data) {
      console.warn("⚠️ Supabase no devolvió datos en la respuesta.");
    }

    console.log("✅ Email de recuperación enviado correctamente a:", email);
    return {
      success: true,
      message:
        "Email de recuperación enviado correctamente. Revisa tu bandeja de entrada o correo no deseado.",
      data: data ?? null,
    };
  } catch (err) {
    console.error("💥 Error inesperado en emailPassword:", err);
    return {
      success: false,
      message: `Error inesperado: ${err.message}`,
      data: null,
    };
  }
}
