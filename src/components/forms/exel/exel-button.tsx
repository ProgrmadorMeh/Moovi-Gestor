'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportarExcel } from '@/lib/functions/exel/descargarDato.js';

interface ExportExcelButtonProps {
  data: any[];
  fileName: string;
  sheetName: string;
}

export function ExportExcelButton({ data, fileName, sheetName }: ExportExcelButtonProps) {

  const handleExport = () => {
    exportarExcel(data, fileName, sheetName);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={!data || data.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Exportar a Excel
    </Button>
  );
}
