'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { methodPost } from '@/lib/functions/metodos/methodPost';

// --- Importamos los nuevos componentes del formulario ---
import { ProductDetailsFields } from '@/components/forms/product/ProductDetailsFields';
import { ProductPricingFields } from '@/components/forms/product/ProductPricingFields';
import { ProductIdentificationFields } from '@/components/forms/product/ProductIdentificationFields';
import { ProductDescriptionField } from '@/components/forms/product/ProductDescriptionField';

// --- Esquemas y valores por defecto (sin cambios) ---
const cellphoneSchema = z.object({
  brand: z.string({ required_error: 'La marca es obligatoria.' }).min(1, 'La marca es obligatoria.'),
  model: z.string().min(1, 'El modelo es obligatorio.'),
  capacity: z.string({ required_error: 'La capacidad es obligatoria.' }).min(1, 'La capacidad es obligatoria.'),
  color: z.string().min(1, 'El color es obligatorio.'),
  salePrice: z.coerce.number().positive('El precio de venta debe ser positivo.'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
  description: z.string().optional(),
  imei: z.string().optional(),
  imageUrl: z.any().optional(),
});

const accessorySchema = z.object({
  category: z.string({ required_error: 'La categoría es obligatoria.' }).min(1, 'La categoría es obligatoria.'),
  brand: z.string({ required_error: 'La marca es obligatoria.' }).min(1, 'La marca es obligatoria.'),
  model: z.string().min(1, 'El modelo es obligatorio.'),
  color: z.string().min(1, 'El color es obligatorio.'),
  salePrice: z.coerce.number().positive('El precio de venta debe ser positivo.'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
  description: z.string().optional(),
  imageUrl: z.any().optional(),
});

type CellphoneFormValues = z.infer<typeof cellphoneSchema>;
type AccessoryFormValues = z.infer<typeof accessorySchema>;

const defaultCellphoneValues: Partial<CellphoneFormValues> = {
  brand: '',
  model: '',
  capacity: '',
  color: '',
  salePrice: 0,
  stock: 0,
  description: '',
  imei: '',
};

const defaultAccessoryValues: Partial<AccessoryFormValues> = {
  category: '',
  brand: '',
  model: '',
  color: '',
  salePrice: 0,
  stock: 0,
  description: '',
};

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [productType, setProductType] = useState('celular');
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<CellphoneFormValues | AccessoryFormValues>({
    resolver: (data, context, options) => {
      const schema = productType === 'celular' ? cellphoneSchema : accessorySchema;
      return zodResolver(schema)(data, context, options);
    },
    defaultValues: defaultCellphoneValues,
  });

  useEffect(() => {
    form.reset(productType === 'celular' ? defaultCellphoneValues : defaultAccessoryValues);
  }, [productType, form]);

  const handleFiles = (filesToAdd: FileList | null) => {
    if (!filesToAdd) return;
    const combined = [...files, ...Array.from(filesToAdd)];
    if (combined.length > 4) {
      toast({
        title: 'Límite de imágenes',
        description: 'No puedes subir más de 4 imágenes.',
        variant: 'destructive'
      });
      return;
    }
    setFiles(combined);
    form.setValue('imageUrl', combined);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    form.setValue('imageUrl', updatedFiles);
  };

  async function onSubmit(data: CellphoneFormValues | AccessoryFormValues) {
    const endpoint = productType === 'celular' ? 'celulares' : 'accesorios';
    const payload = { ...data, files };

    const resp = await methodPost(payload, endpoint);

    toast({
      title: resp.success ? 'Producto Guardado' : 'Error al guardar',
      description: resp.message,
      variant: resp.success ? 'default' : 'destructive',
    });

    if (resp.success) router.push('/inventario');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto grid max-w-5xl flex-1 auto-rows-max gap-4">
          <div className="flex justify-center">
            <Tabs value={productType} onValueChange={setProductType}>
              <TabsList>
                <TabsTrigger value="celular">Celular</TabsTrigger>
                <TabsTrigger value="accesorio">Accesorio</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cargar Nuevo {productType === 'celular' ? 'Celular' : 'Accesorio'}</CardTitle>
              <CardDescription>
                Ingresa los detalles del nuevo producto. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6">
                <ProductDetailsFields control={form.control} productType={productType} />
                <ProductPricingFields control={form.control} />
                <ProductIdentificationFields 
                  control={form.control} 
                  productType={productType} 
                  newFiles={files} 
                  existingImageUrls={[]}
                  handleFiles={handleFiles} 
                  removeNewFile={removeFile}
                  removeExistingFile={() => {}}
                />
                <ProductDescriptionField control={form.control} />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/inventario">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Producto'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
