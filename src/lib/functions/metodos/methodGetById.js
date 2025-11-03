import { supabase } from '../../supabaseClient.js';

/**
 * Obtiene un solo registro de una tabla específica mediante su ID.
 * @param {string} tabla - El nombre de la tabla
 * @param {string | number} id - El ID del registro a buscar
 * @returns {Promise<{ success: boolean, message: string, data: any | null }>}
 */

export async function methodGetById(tabla, id) {

  if (!tabla || !id) {
    return {
      success: false,
      message: 'Debes proporcionar el nombre de la tabla y un ID válido.',
      data: null,
    };
  }

  try {
    const isUserTable = tabla === 'user' || tabla === 'users';
    
    // El query builder para poder añadir joins condicionalmente
    let query = supabase.from(tabla);
    
    // Construimos el SELECT
    let selectString = '*';
    if (tabla === 'celulares' || tabla === 'accesorios') {
      selectString = '*, marcas(nombre)';
    }

    const { data, error } = await query
      .select(selectString)
      .eq('id', id)
      .single(); // <- importante: solo devuelve un registro

    if (error) {
       // Si no se encuentra el registro, Supabase devuelve un error que podemos manejar.
      if (error.code === 'PGRST116') {
         return {
          success: false,
          message: `No se encontró ningún registro con el ID ${id} en la tabla "${tabla}".`,
          data: null,
        };
      }
      // Para otros errores, los lanzamos
      throw error;
    }

    let processedData = data;
    // Hacemos el post-procesamiento si es necesario
    if ((tabla === 'celulares' || tabla === 'accesorios') && data.marcas) {
       processedData.nombre_marca = data.marcas.nombre;
       // No borramos 'marcas' por si se usa en otro lado, pero podríamos hacerlo
       // delete processedData.marcas;
    }
     
    // No es necesario un procesamiento especial para la tabla de usuarios aquí
    // porque el SELECT ya es simple.

    return {
      success: true,
      message: `Registro encontrado correctamente en la tabla "${tabla}".`,
      data: processedData,
    };

  } catch (err) {
    return {
      success: false,
      message: `Error inesperado al obtener por ID: ${err.message}`,
      data: null,
    };
  }
}
