'use client';

import { Control, useFieldArray } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductSpecificationsFieldProps {
  control: Control<any>;
}

export function ProductSpecificationsField({ control }: ProductSpecificationsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications"
  });

  return (
    <div>
        <Separator className="my-4" />
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Especificaciones Técnicas</h3>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ key: '', value: '' })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir
            </Button>
        </div>
      
        <div className="grid gap-4">
            {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-x-4 items-start">
                <div className="col-span-5">
                    <FormField
                    control={control}
                    name={`specifications.${index}.key`}
                    render={({ field }) => (
                        <FormItem>
                        {index === 0 && <FormLabel>Característica</FormLabel>}
                        <FormControl>
                            <Input placeholder="Ej: Pantalla" {...field} />
                        </FormControl>
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
                        {index === 0 && <FormLabel>Valor</FormLabel>}
                        <FormControl>
                            <Input placeholder="Ej: 6.7 pulgadas Super Retina XDR" {...field} />
                        </FormControl>
                         <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="col-span-1 flex items-center h-10">
                    <Checkbox
                        className="border-destructive text-destructive"
                        aria-label="Eliminar especificación"
                        onCheckedChange={() => remove(index)}
                    />
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
