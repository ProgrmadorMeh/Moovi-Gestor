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

interface ProductFinancingFieldsProps {
  control: Control<any>;
}

export function ProductFinancingFields({ control }: ProductFinancingFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <FormField
        control={control}
        name="installments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Máximo de Cuotas</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Ej: 12"
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
        name="installmentPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio por Cuota ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Ej: 150.00"
                {...field} 
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
