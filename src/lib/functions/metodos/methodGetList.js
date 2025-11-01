import { supabase } from '../../supabaseClient';
import { cache } from 'react';

export const methodGetList = cache(async (tabla, filtros = {}, campos = "*") => {
  if (!tabla) {
    return {
      success: false,
      message: 'Debes proporcionar el nombre de la tabla.',
      data: null,
    };
  }

  try {
    const condiciones = Object.entries(filtros)
      .filter(([_, valor]) => valor && valor.toString().trim() !== '')
      .map(([campo, valor]) => `${campo}.ilike.%${valor.toString().trim()}%`)
      .join(',');

    let selectQuery = campos;

    if (tabla === "celulares" || tabla === "accesorios") {
      selectQuery = `
        *,
        marcas(nombre)
      `;
    }

    let query = supabase.from(tabla).select(selectQuery);

    if (condiciones) {
      query = query.or(condiciones);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        message: `Error al buscar en tabla "${tabla}": ${error.message}`,
        data: null,
      };
    }
    
    return {
      success: true,
      message: data.length
        ? `Se encontraron ${data.length} registros en la tabla "${tabla}".`
        : `No se encontraron registros en la tabla "${tabla}" con los filtros proporcionados.`,
      data: data,
    };

  } catch (error) {
    return {
      success: false,
      message: `Error inesperado: ${error.message}`,
      data: null,
    };
  }
});