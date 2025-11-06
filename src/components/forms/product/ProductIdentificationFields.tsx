
'use client';

import { Control } from 'react-hook-form';
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
  newFiles: File[];
  existingImageUrls: string[];
  handleFiles: (files: FileList | null) => void;
  removeNewFile: (index: number) => void;
  removeExistingFile: (url: string) => void;
}

export function ProductIdentificationFields({ 
  control, 
  productType, 
  newFiles, 
  existingImageUrls,
  handleFiles, 
  removeNewFile,
  removeExistingFile
}: ProductIdentificationFieldsProps) {
  const totalImages = newFiles.length + existingImageUrls.length;

  return (
    <div className="grid grid-cols-1 gap-6">
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
      
      <div>
        <FormLabel>Imágenes (máx. 4)</FormLabel>
        <div
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted"
        >
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={(e) => handleFiles(e.target.files)} 
            className="hidden" 
            id="imageInput"
            disabled={totalImages >= 4}
          />
          <label htmlFor="imageInput" className={`cursor-pointer ${totalImages >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Arrastra o selecciona hasta {4 - totalImages} imágen(es) más
          </label>
        </div>
        
        {(existingImageUrls.length > 0 || newFiles.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {/* Render existing images */}
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img src={url} alt={`Imagen existente ${index + 1}`} className="rounded-md object-cover w-full h-32" />
                <button type="button" onClick={() => removeExistingFile(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-80 hover:opacity-100">
                  ✕
                </button>
              </div>
            ))}
            {/* Render new file previews */}
            {newFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative group">
                <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="rounded-md object-cover w-full h-32" />
                <button type="button" onClick={() => removeNewFile(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-80 hover:opacity-100">
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

    