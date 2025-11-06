
import * as XLSX from 'xlsx';
import { supabase } from '../../supabaseClient.js'; // Asegúrate de importar tu cliente
import { methodPost } from '../metodos/methodPost.js';

export async function subirDatos(file, productType) {
  if (!file) return { success: false, message: 'No se proporcionó ningún archivo.' };
  if (productType !== 'celular' && productType !== 'accesorio')
    return { success: false, message: 'Tipo de producto no válido.' };

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0)
          return resolve({ success: false, message: 'El archivo Excel está vacío.' });

        // 🔹 Obtener todas las marcas disponibles desde Supabase
        const { data: marcas, error: marcasError } = await supabase
          .from('marcas')
          .select('id, nombre'); // Cambiado de 'brand' a 'nombre'

        if (marcasError) {
          console.error(marcasError);
          return reject({
            success: false,
            message: 'Error al obtener las marcas desde la base de datos.',
          });
        }

        // Crear mapa para búsquedas rápidas de marca -> id
        const marcaMap = new Map(marcas.map((m) => [m.nombre.toLowerCase(), m.id]));

        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        const tableName = productType === 'celular' ? 'celulares' : 'accesorios';

        await Promise.all(
          json.map(async (row, index) => {
            try {
              // 🔍 Buscar id de la marca según el nombre
              const brandName = (row.brand || '').toLowerCase().trim();
              const id_brand = marcaMap.get(brandName);

              if (!id_brand) {
                errorCount++;
                errors.push(
                  `Fila ${index + 2}: Marca "${row.brand}" no encontrada en la base de datos.`
                );
                return;
              }
              
              const productData = {
                // Ya no pasamos 'brand', sino 'id_brand' directamente
                id_brand: id_brand,
                model: row.model || '',
                color: row.color || '',
                salePrice: Number(row.salePrice) || 0,
                costPrice: Number(row.costPrice) || 0,
                stock: Number(row.stock) || 0,
                initialStock: Number(row.initialStock) || 0,
                description: row.description || '',
                imei: productType === 'celular' ? row.imei || null : undefined,
                shipping: row.shipping === 'TRUE' || row.shipping === true,
                discount: row.discount || null,
                installments: row.installments || null,
                installmentPrice: row.installmentPrice || null,
                imageUrl: row.imageUrl ? JSON.parse(row.imageUrl) : [],
              };
               
              // El 'brand' ahora se maneja en el methodPost a través del id_brand
              productData.brand = row.brand;

              // 🔧 Agregar dataTecnica si es celular
              if (productType === 'celular') {
                const dataTecnica = {};
                const techKeys = ["Pantalla", "Procesador", "RAM", "Almacenamiento", "Cámara Principal", "Batería", "Sistema Operativo"];
                techKeys.forEach(key => {
                    if(row[key]) dataTecnica[key] = row[key];
                })
                productData.dataTecnica = dataTecnica;
              } else {
                 productData.category = row.category || 'Otro';
              }


              // 🔼 Subir a la tabla correspondiente
              const result = await methodPost(productData, tableName);

              if (result.success) successCount++;
              else {
                errorCount++;
                errors.push(`Fila ${index + 2}: ${result.message}`);
              }
            } catch (err) {
              errorCount++;
              errors.push(`Fila ${index + 2}: Error inesperado - ${err.message}`);
            }
          })
        );

        const summaryMessage = `Carga completada. ${successCount} productos guardados, ${errorCount} errores.`;
        resolve({
          success: true,
          message: summaryMessage,
          results: { successCount, errorCount, errors },
        });
      } catch (err) {
        reject({
          success: false,
          message: `Error al procesar el archivo: ${err.message}`,
        });
      }
    };

    reader.onerror = () =>
      reject({ success: false, message: 'Error al leer el archivo.' });

    reader.readAsArrayBuffer(file);
  });
}
