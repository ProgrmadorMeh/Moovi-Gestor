
'use client';

import { Control, useFieldArray } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from 'react';

interface ProductdataTecnicaFieldProps {
  control: Control<any>;
}

const commonKeys = [
  "Pantalla",
  "Procesador",
  "RAM",
  "Almacenamiento",
  "Capacidad",
  "Cámara Principal",
  "Cámara Frontal",
  "Batería",
  "Sistema Operativo",
  "Dimensiones",
  "Peso",
  "Conectividad"
];

export function ProductdataTecnicaField({ control }: ProductdataTecnicaFieldProps) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "dataTecnica"
  });

  // Local state to track which fields are using a custom key
  const [customKeyIndices, setCustomKeyIndices] = useState<Set<number>>(new Set());

  // Initialize customKeyIndices based on initial form values
  useEffect(() => {
    const initialCustomIndices = new Set<number>();
    fields.forEach((field, index) => {
      // @ts-ignore
      if (field.key && !commonKeys.includes(field.key)) {
        initialCustomIndices.add(index);
      }
    });
    setCustomKeyIndices(initialCustomIndices);
  }, [fields.length]); // Depend on fields.length to re-evaluate when fields are added/removed


  const handleSelectChange = (index: number, value: string) => {
    const newCustomKeyIndices = new Set(customKeyIndices);
    if (value === 'otro') {
      newCustomKeyIndices.add(index);
      // Clear the field value when switching to custom input
      const currentField = fields[index];
      // @ts-ignore
      update(index, { ...currentField, key: '' });

    } else {
      newCustomKeyIndices.delete(index);
    }
    setCustomKeyIndices(newCustomKeyIndices);
  };

  const handleAppend = () => {
    append({ key: '', value: '' });
  };
  
  const handleRemove = (index: number) => {
    remove(index);
    // Also remove from our local state tracking
    const newCustomKeyIndices = new Set(customKeyIndices);
    newCustomKeyIndices.delete(index);
    setCustomKeyIndices(newCustomKeyIndices);
  };


  return (
    <div>
        <Separator className="my-4" />
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Especificaciones Técnicas</h3>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAppend}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir
            </Button>
        </div>
      
        <div className="grid gap-4">
            {fields.length > 0 && (
                 <div className="grid grid-cols-12 gap-x-4 items-start">
                    <div className="col-span-5">
                       <Label>Característica</Label>
                    </div>
                     <div className="col-span-6">
                        <Label>Valor</Label>
                    </div>
                </div>
            )}

            {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-x-4 items-start">
                <div className="col-span-5">
                   <FormField
                    control={control}
                    name={`dataTecnica.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                         {customKeyIndices.has(index) ? (
                            <FormControl>
                                <Input placeholder="Característica custom" {...field} />
                            </FormControl>
                          ) : (
                            <Select onValueChange={(value) => {
                                handleSelectChange(index, value);
                                if (value !== 'otro') {
                                    field.onChange(value);
                                }
                            }} value={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {commonKeys.map(key => (
                                        <SelectItem key={key} value={key}>{key}</SelectItem>
                                    ))}
                                    <SelectItem value="otro">Otra...</SelectItem>
                                </SelectContent>
                            </Select>
                          )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                    <FormField
                    control={control}
                    name={`dataTecnica.${index}.value`}
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input placeholder="Ej: 6.7 pulgadas Super Retina XDR" {...field} />
                        </FormControl>
                         <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="col-span-1 flex items-center h-10">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </div>
            </div>
            ))}
        </div>
        {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
                No se han añadido especificaciones.
            </p>
        )}
    </div>
  );
}
