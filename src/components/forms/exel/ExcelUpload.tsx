'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subirDatos } from '@/lib/functions/exel/subirDatos.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface ExcelUploadProps {
  onUploadSuccess: () => void;
}

export function ExcelUpload({ onUploadSuccess }: ExcelUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [productType, setProductType] = useState<'celular' | 'accesorio' | ''>('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = React.createRef<HTMLInputElement>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'Error', description: 'Por favor, selecciona un archivo.', variant: 'destructive' });
      return;
    }
    if (!productType) {
      toast({ title: 'Error', description: 'Por favor, selecciona el tipo de producto.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    
    subirDatos(file, productType)
      .then(result => {
        let description = result.message;
        if (result.results && result.results.errorCount > 0) {
          const errorDetails = result.results.errors.slice(0, 5).join('\n'); // Muestra hasta 5 errores
          description += `\nErrores:\n${errorDetails}`;
        }
        
        toast({
          title: result.success ? 'Carga Finalizada' : 'Error en la Carga',
          description: <pre className="whitespace-pre-wrap">{description}</pre>,
          variant: result.success && result.results.errorCount === 0 ? 'default' : 'destructive',
          duration: 15000,
        });

        if (result.success) {
          onUploadSuccess();
          setIsOpen(false);
          setFile(null);
          setProductType('');
        }
      })
      .catch(err => {
         toast({
          title: 'Error Inesperado',
          description: err.message || 'Ocurrió un problema al subir el archivo.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Importar Excel
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir Productos desde Excel</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de producto y el archivo .xlsx para la carga masiva.
            Asegúrate que las columnas coincidan con los campos requeridos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product-type">Tipo de Producto</Label>
            <Select onValueChange={(value) => setProductType(value as any)} value={productType}>
                <SelectTrigger id="product-type">
                    <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="celular">Celulares</SelectItem>
                    <SelectItem value="accesorio">Accesorios</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
             <Label htmlFor="excel-file">Archivo (.xlsx)</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={isUploading || !file || !productType}>
            {isUploading ? 'Subiendo...' : 'Confirmar y Subir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
