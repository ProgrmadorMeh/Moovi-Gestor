import * as XLSX from 'xlsx';
import { supabase } from '../../supabaseClient.js';
import { methodPost } from '../metodos/methodPost.js';
import { getMarcas } from '../../data.js';

// Función para calcular la distancia de Levenshtein
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}


export async function subirDatos(file, productType) {
  if (!file) return Promise.reject({ message: 'No se proporcionó ningún archivo.' });
  if (productType !== 'celular' && productType !== 'accesorio')
    return Promise.reject({ message: 'Tipo de producto no válido.' });

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

        const marcas = await getMarcas(true); // Forzar refresh para tener las últimas marcas
        if (!marcas || marcas.length === 0) {
            return reject({ message: 'No se pudieron obtener las marcas de la base de datos.' });
        }
        
        const marcaMap = new Map(marcas.map((m) => [m.nombre.toLowerCase(), m.id]));

        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        const tableName = productType === 'celular' ? 'celulares' : 'accesorios';

        for (const [index, row] of json.entries()) {
           try {
              const brandNameFromExcel = (row.brand || '').toLowerCase().trim();
              let id_brand;
              let bestMatch = null;
              let minDistance = 4; // Umbral de 3 caracteres

              for (const [dbBrandName, dbBrandId] of marcaMap.entries()) {
                  const distance = levenshteinDistance(brandNameFromExcel, dbBrandName);
                  if (distance < minDistance) {
                      minDistance = distance;
                      bestMatch = dbBrandName;
                      id_brand = dbBrandId;
                  }
              }
              
              const brandToUse = bestMatch ? marcas.find(m => m.id === id_brand)?.nombre : row.brand;


              const baseProductData = {
                brand: brandToUse || row.brand || '',
                model: row.model || '',
                color: row.color || '',
                salePrice: Number(row.salePrice) || 0,
                costPrice: Number(row.costPrice) || 0,
                stock: Number(row.stock) || 0,
                description: row.description || '',
                shipping: String(row.shipping).toUpperCase() === 'TRUE',
                discount: row.discount ? Number(row.discount) : null,
                installments: row.installments ? Number(row.installments) : null,
                installmentPrice: row.installmentPrice ? Number(row.installmentPrice) : null,
                imageUrl: row.imageUrl ? JSON.parse(row.imageUrl) : [],
              };
              
              let productData;

              if (productType === 'celular') {
                  const dataTecnica = {};
                  const techKeys = ["Pantalla", "Procesador", "RAM", "Almacenamiento", "Cámara Principal", "Cámara Frontal", "Batería", "Sistema Operativo", "Dimensiones", "Peso", "Conectividad", "Capacidad"];
                   techKeys.forEach(key => {
                      if(row[key]) dataTecnica[key] = row[key];
                  });

                  productData = {
                      ...baseProductData,
                      imei: row.imei || null,
                      dataTecnica,
                  };
              } else { // accesorio
                  productData = {
                      ...baseProductData,
                      category: row.category || 'Otro',
                  };
              }

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
        }

        const summaryMessage = `Carga completada. ${successCount} productos guardados, ${errorCount} errores.`;
        resolve({
          success: true,
          message: summaryMessage,
          results: { successCount, errorCount, errors },
        });
      } catch (err) {
        reject({
          message: `Error al procesar el archivo: ${err.message}`,
        });
      }
    };

    reader.onerror = () =>
      reject({ message: 'Error al leer el archivo.' });

    reader.readAsArrayBuffer(file);
  });
}
