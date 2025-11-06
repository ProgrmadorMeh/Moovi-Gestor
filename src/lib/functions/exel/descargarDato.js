import * as XLSX from 'xlsx';

/**
 * Exporta un array de datos a un archivo Excel.
 * @param {any[]} data - El array de objetos a exportar.
 * @param {string} fileName - El nombre del archivo (sin extensión).
 * @param {string} sheetName - El nombre de la hoja de cálculo.
 */
export function exportarExcel(data, fileName, sheetName) {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  // Pre-procesar los datos para aplanar el objeto y excluir campos
  const processedData = data.map(item => {
    const { dataTecnica, imageUrl, ...rest } = item;
    
    let flatItem = { ...rest };

    // Aplanar campos complejos si es necesario, pero dataTecnica e imageUrl se omiten
    // Ejemplo de aplanamiento para 'marcas' si fuera un objeto
    if (flatItem.marcas && typeof flatItem.marcas === 'object') {
        flatItem.marca_nombre = flatItem.marcas.nombre;
        delete flatItem.marcas;
    }
    
    // Convertir arrays a string si es necesario, pero omitiendo imageUrl
    Object.keys(flatItem).forEach(key => {
        if (Array.isArray(flatItem[key])) {
            flatItem[key] = JSON.stringify(flatItem[key]);
        }
    });

    return flatItem;
  });


  // Crear la hoja de cálculo y el libro de trabajo
  const worksheet = XLSX.utils.json_to_sheet(processedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Descargar el archivo
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
