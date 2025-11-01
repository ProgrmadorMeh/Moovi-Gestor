import * as XLSX from 'xlsx';

/**
 * Exporta un array de objetos a un archivo Excel.
 * @param {any[]} data - El array de datos a exportar.
 * @param {string} fileName - El nombre del archivo sin la extensión .xlsx.
 * @param {string} sheetName - El nombre de la hoja dentro del archivo Excel.
 */
export function exportarExcel(data, fileName, sheetName) {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Los datos proporcionados no son un array válido o están vacíos.");
    alert("No hay datos para exportar.");
    return;
  }

  try {
    // Crear una hoja de cálculo a partir de los datos
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Añadir la hoja de cálculo al libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generar el archivo y disparar la descarga
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    alert("Ocurrió un error al intentar exportar los datos.");
  }
}
