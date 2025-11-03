'use client';

import { Control, UseFormSetValue } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ProductIdentificationFieldsProps {
  control: Control<any>;
  productType: 'celular' | 'accesorio';
  files: File[];
  handleFiles: (files: FileList | null) => void;
  removeFile: (index: number) => void;
}

export function ProductIdentificationFields({ 
  control, 
  productType, 
  files, 
  handleFiles, 
  removeFile 
}: ProductIdentificationFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {productType === 'celular' && (
        <FormField
          control={control}
          name="imei"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IMEI / Serial</FormLabel>
              <FormControl><Input placeholder="Opcional" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <div className={productType === 'celular' ? '' : 'md:col-span-2'}>
        <FormLabel>Imágenes (máx. 4)</FormLabel>
        <div
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted"
        >
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" id="imageInput" />
          <label htmlFor="imageInput" className="cursor-pointer">Arrastra o selecciona hasta 4 imágenes</label>
        </div>
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="rounded-md object-cover w-full h-32" />
                <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-80 hover:opacity-100">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
