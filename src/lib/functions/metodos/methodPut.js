import { supabase } from '../../supabaseClient.js';

/**
 * Modificar registros de la tabla mediante un ID.
 * @param {string} tabla - Nombre de la tabla en Supabase.
 * @param {Object} datos - Datos del registro a cambiar, debe incluir el 'id'.
 * @returns {Promise<{ success: boolean, message: string, data: any[] | null }>}
 */
export async function methodPut(tabla, datos){
  const { id, ...campos } = datos;
  if (!id) {
    return {
      success: false,
      message: "Es necesario la entrada de un ID para actualizar.",
      data: null,
    };
  }

  try {
    // Lógica para manejar la marca del producto
    if ((tabla === 'celulares' || tabla === 'accesorios') && campos.brand) {
      const { data: marcaExistente, error: marcaError } = await supabase
        .from('marcas')
        .select('id')
        .eq('nombre', campos.brand)
        .single();

      let marcaId;
      if (marcaError && marcaError.code !== 'PGRST116') throw marcaError;

      if (marcaExistente) {
        marcaId = marcaExistente.id;
      } else {
        const { data: nuevaMarca, error: errorMarcaInsert } = await supabase
          .from('marcas')
          .insert({ nombre: campos.brand })
          .select()
          .single();

        if (errorMarcaInsert) throw errorMarcaInsert;
        marcaId = nuevaMarca.id;
      }

      campos.id_brand = marcaId;
      delete campos.brand;
    }

    const { data, error } = await supabase
      .from(tabla)
      .update(campos)
      .eq('id', id)
      .select();

    if (error) {
      return {
        success: false,
        message: `Error al actualizar el campo: ${error.message}`,
        data: null,
      }
    }

    return {
      success: true,
      message: "Registro actualizado correctamente.",
      data: data ?? null,
    }
  } catch (err) {
    return {
      success: false,
      message: `Error inesperado: ${err.message}`,
      data: null,
    }
  }
};
