import { supabase } from '../../supabaseServer.js';

/**
 * Obtiene usuarios combinando Supabase Auth con la tabla 'user'.
 * @param {string} tabla - Solo funciona con "authUsers"
 * @returns {Promise<{ success: boolean, message: string, data: any[] | null }>}
 */
export async function methodGetListAuth(tabla) {
  if (!tabla) {
    return {
      success: false,
      message: 'Debes proporcionar el nombre de la tabla.',
      data: null,
    };
  }

  try {
    if (tabla === "authUsers") {
      // 1. Traer usuarios de Auth
      const { data: dataAuthUser, error: errorAuthUser } = await supabase.auth.admin.listUsers();
      if (errorAuthUser) {
        return {
          success: false,
          message: `Error al buscar en tabla "${tabla}": ${errorAuthUser.message}`,
          data: null,
        };
      }

      // 2. Traer usuarios de tu tabla 'user'
      const { data: dataUser, error: errorUser } = await supabase.from("user").select("*");
      if (errorUser) {
        return {
          success: false,
          message: `Error al buscar en tabla "${tabla}": ${errorUser.message}`,
          data: null,
        };
      }

      // 3. Combinar datos
      dataAuthUser.users.forEach(authUser => {
        const userInfo = dataUser.find(u => u.id === authUser.id);
        authUser.name = userInfo?.name || authUser.email || "Sin nombre";
        authUser.role = userInfo?.role || "user";
        authUser.avatarUrl = userInfo?.avatarUrl || "/avatars/default.png";
      });

      return {
        success: true,
        message: `Se encontraron ${dataAuthUser.users.length} registros en la tabla "${tabla}".`,
        data: dataAuthUser.users,
      };
    }

    return {
      success: false,
      message: `La tabla "${tabla}" no está soportada.`,
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error inesperado: ${error.message}`,
      data: null,
    };
  }
}
