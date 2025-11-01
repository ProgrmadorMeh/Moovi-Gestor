import * as XLSX from 'xlsx';
import { methodPost } from '../metodos/methodPost';

/**
 * Lee un archivo de Excel, lo convierte a JSON y sube los datos
 * usando una función específica (methodPost).
 * @param {File} file - El archivo de Excel a procesar.
 * @param {'celular' | 'accesorio'} productType - El tipo de producto a subir.
 * @returns {Promise<{success: boolean, message: string, results: {successCount: number, errorCount: number, errors: string[]}}>}
 */
export async function subirDatos(file, productType) {
  if (!file) {
    return { success: false, message: 'No se proporcionó ningún archivo.' };
  }
  if (productType !== 'celular' && productType !== 'accesorio') {
    return { success: false, message: 'Tipo de producto no válido.' };
  }

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          resolve({ success: false, message: 'El archivo Excel está vacío.' });
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        const tableName = productType === 'celular' ? 'celulares' : 'accesorios';

        // Procesar cada fila del excel en paralelo
        await Promise.all(json.map(async (row, index) => {
          try {
            // Asegurarnos que todos los campos requeridos existan, aunque sea vacíos
            const productData = {
                brand: row.brand || '',
                model: row.model || '',
                color: row.color || '',
                salePrice: Number(row.salePrice) || 0,
                stock: Number(row.stock) || 0,
                description: row.description || '',
                // Campos específicos de celular
                capacity: productType === 'celular' ? row.capacity || '' : undefined,
                imei: productType === 'celular' ? row.imei || '' : undefined,
                // Campo específico de accesorio
                category: productType === 'accesorio' ? row.category || '' : undefined
            };

            const result = await methodPost(productData, tableName);

            if (result.success) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`Fila ${index + 2}: ${result.message}`);
            }
          } catch (err) {
            errorCount++;
            errors.push(`Fila ${index + 2}: Error inesperado - ${err.message}`);
          }
        }));

        const summaryMessage = `Carga completada. ${successCount} productos guardados, ${errorCount} errores.`;
        resolve({ success: true, message: summaryMessage, results: { successCount, errorCount, errors } });

      } catch (err) {
        reject({ success: false, message: `Error al procesar el archivo: ${err.message}` });
      }
    };

    reader.onerror = (err) => {
      reject({ success: false, message: 'Error al leer el archivo.' });
    };

    reader.readAsArrayBuffer(file);
  });
}
