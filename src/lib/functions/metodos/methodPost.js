export async function methodPost(datos, tabla) {
  for (const [key, value] of Object.entries(datos)) {
    if (!value && key !== 'description' && key !== 'imei' && key !== 'files') {
      return { success: false, message: `El campo "${key}" es obligatorio`, data: null };
    }
  }

  try {
    if (tabla === 'celulares' && datos.brand) {
      const { data: marcaExistente, error: marcaError } = await supabase
        .from('marcas')
        .select('id')
        .eq('nombre', datos.brand)
        .single();

      let marcaId;
      if (marcaError && marcaError.code !== 'PGRST116') throw marcaError;

      if (marcaExistente) {
        marcaId = marcaExistente.id;
      } else {
        const { data: nuevaMarca, error: errorMarcaInsert } = await supabase
          .from('marcas')
          .insert({ nombre: datos.brand })
          .select()
          .single();

        if (errorMarcaInsert) throw errorMarcaInsert;
        marcaId = nuevaMarca.id;
      }

      datos.id_brand = marcaId;
      delete datos.brand;
    }

    // 🔹 Subida múltiple de imágenes (si existen)
    if (datos.files && Array.isArray(datos.files) && datos.files.length > 0) {
      const uploadedUrls = [];

      for (const file of datos.files.slice(0, 4)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `productos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagenes')
          .upload(filePath, file);

        if (uploadError) {
          return { success: false, message: `Error al subir ${file.name}: ${uploadError.message}`, data: null };
        }

        const { data: publicUrlData } = supabase.storage
          .from('imagenes')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      datos.imageUrls = uploadedUrls;
      delete datos.files;
    }

    // 🔹 Insertar el celular
    const { data, error } = await supabase.from(tabla).insert(datos).select();

    if (error) {
      return { success: false, message: `Error al insertar en ${tabla}: ${error.message}`, data: null };
    }

    return {
      success: true,
      message: 'Registro insertado correctamente',
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error inesperado: ${err.message}`,
      data: null,
    };
  }
}
