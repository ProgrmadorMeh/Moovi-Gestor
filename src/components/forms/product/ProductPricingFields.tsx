
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

interface ProductPricingFieldsProps {
  control: Control<any>;
}

export function ProductPricingFields({ control }: ProductPricingFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
       <FormField
        control={control}
        name="costPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio de Costo ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Ej: 900.00"
                {...field} 
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                value={field.value ?? ''} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="salePrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio de Venta ($) *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                {...field} 
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                value={field.value ?? ''} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={control}
        name="discount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descuento (%)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="Ej: 10"
                {...field} 
                onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                value={field.value ?? ''} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock Inicial *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                value={field.value ?? ''} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

    