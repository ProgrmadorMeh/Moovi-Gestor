import { supabase } from '../../supabaseClient';

/**
 * Registra un nuevo usuario con email y contraseña.
 * @param {string} email - Email del nuevo usuario.
 * @param {string} password - Contraseña para el nuevo usuario.
 * @param {Object} options - Opciones adicionales, como 'data' para el nombre de usuario.
 * @returns {Promise<{ success: boolean, message: string, data: any | null }>}
 */
export async function signUp(email, password, options = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      return {
        success: false,
        message: `Error en el registro: ${error.message}`,
        data: null,
      };
    }

    // El objeto 'data.user' puede ser null si se requiere confirmación por correo.
    if (data.user) {
         return {
            success: true,
            message: "Usuario registrado correctamente. Por favor, revisa tu correo para confirmar la cuenta.",
            data: data.user,
        };
    }

    return {
        success: true,
        message: "Registro iniciado. Revisa tu correo para completar el proceso.",
        data: null
    }

  } catch (err) {
    return {
      success: false,
      message: `Error inesperado: ${err.message}`,
      data: null,
    };
  }
}
