'use client';

import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface ProductDescriptionFieldProps {
  control: Control<any>;
}

export function ProductDescriptionField({ control }: ProductDescriptionFieldProps) {
  return (
    <div>
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Breve descripción y características clave." 
                className="resize-none" 
                {...field} 
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
