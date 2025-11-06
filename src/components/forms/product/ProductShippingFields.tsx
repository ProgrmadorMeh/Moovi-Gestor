'use client';

import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormDescription
} from "@/components/ui/form";
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductShippingFieldsProps {
  control: Control<any>;
}

export function ProductShippingFields({ control }: ProductShippingFieldsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Envío</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="shipping"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Envío Disponible</FormLabel>
                <FormDescription>
                  Activa si este producto puede ser enviado.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
