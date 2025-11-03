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
}

export function ProductDetailsFields({ control, productType }: ProductDetailsFieldsProps) {
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
                <SelectItem value="Apple">Apple</SelectItem>
                <SelectItem value="Samsung">Samsung</SelectItem>
                <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                <SelectItem value="Motorola">Motorola</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="JBL">JBL</SelectItem>
                <SelectItem value="Anker">Anker</SelectItem>
                <SelectItem value="Otro">Otra</SelectItem>
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

      {/* Capacidad (Solo para Celulares) */}
      {productType === 'celular' && (
         <FormField
            control={control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad (GB/TB) *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecciona la capacidad" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="128GB">128GB</SelectItem>
                    <SelectItem value="256GB">256GB</SelectItem>
                    <SelectItem value="512GB">512GB</SelectItem>
                    <SelectItem value="1TB">1TB</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
      )}

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
