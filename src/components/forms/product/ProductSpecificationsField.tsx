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
import { useState } from 'react';

interface ProductSpecificationsFieldProps {
  control: Control<any>;
}

const commonKeys = [
  "Pantalla",
  "Procesador",
  "RAM",
  "Almacenamiento",
  "Cámara Principal",
  "Cámara Frontal",
  "Batería",
  "Sistema Operativo",
  "Dimensiones",
  "Peso",
  "Conectividad"
];

export function ProductSpecificationsField({ control }: ProductSpecificationsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications"
  });

  // Local state to track which fields are using a custom key
  const [customKeyIndices, setCustomKeyIndices] = useState<Set<number>>(new Set());

  const handleSelectChange = (index: number, value: string) => {
    const newCustomKeyIndices = new Set(customKeyIndices);
    if (value === 'otro') {
      newCustomKeyIndices.add(index);
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
                    name={`specifications.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                         {customKeyIndices.has(index) ? (
                            <FormControl>
                                <Input placeholder="Característica custom" {...field} />
                            </FormControl>
                          ) : (
                            <Select onValueChange={(value) => {
                                handleSelectChange(index, value);
                                field.onChange(value === 'otro' ? '' : value);
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
                    name={`specifications.${index}.value`}
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
