'use client';

import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ProductDetailsFieldsProps {
  control: Control<any>;
  productType: 'celular' | 'accesorio';
  marcas: { id: string; nombre: string }[];
}

export function ProductDetailsFields({ control, productType, marcas }: ProductDetailsFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Categoria (Solo para Accesorios) */}
      {productType === 'accesorio' && (
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cargador">Cargador</SelectItem>
                  <SelectItem value="Funda">Funda</SelectItem>
                  <SelectItem value="Auriculares">Auriculares</SelectItem>
                  <SelectItem value="Protector">Protector de Pantalla</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ''}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {marcas.map(marca => (
                  <SelectItem key={marca.id} value={marca.nombre}>
                    {marca.nombre}
                  </SelectItem>
                ))}
                <SelectItem value="Otra">Otra (Crear nueva)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo *</FormLabel>
            <FormControl><Input placeholder="Ej: iPhone 15 Pro, Cargador 20W" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Color *</FormLabel>
            <FormControl><Input placeholder="Ej: Negro, Blanco" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
