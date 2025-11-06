
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
import { getMarcas } from '@/lib/data'; // Importar getMarcas

// --- Importamos los nuevos componentes del formulario ---
import { ProductDetailsFields } from '@/components/forms/product/ProductDetailsFields';
import { ProductPricingFields } from '@/components/forms/product/ProductPricingFields';
import { ProductIdentificationFields } from '@/components/forms/product/ProductIdentificationFields';
import { ProductDescriptionField } from '@/components/forms/product/ProductDescriptionField';
import { ProductdataTecnicaField } from '@/components/forms/product/ProductSpecificationsField';
import { ProductShippingFields } from '@/components/forms/product/ProductShippingFields';
import { ProductFinancingFields } from '@/components/forms/product/ProductFinancingFields';
import { Separator } from '@/components/ui/separator';

// --- Esquemas y valores por defecto (sin cambios) ---
const baseSchema = {
  brand: z.string({ required_error: 'La marca es obligatoria.' }).min(1, 'La marca es obligatoria.'),
  model: z.string().min(1, 'El modelo es obligatorio.'),
  color: z.string().min(1, 'El color es obligatorio.'),
  salePrice: z.coerce.number().positive('El precio de venta debe ser positivo.'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
  description: z.string().optional(),
  imageUrl: z.any().optional(),
  costPrice: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  shipping: z.boolean().optional(),
  installments: z.coerce.number().optional(),
  installmentPrice: z.coerce.number().optional(),
};

const cellphoneSchema = z.object({
  ...baseSchema,
  imei: z.string().optional(),
  dataTecnica: z.array(z.object({
    key: z.string().min(1, 'La característica no puede estar vacía.'),
    value: z.string().min(1, 'El valor no puede estar vacío.'),
  })).optional(),
});

const accessorySchema = z.object({
  ...baseSchema,
  category: z.string({ required_error: 'La categoría es obligatoria.' }).min(1, 'La categoría es obligatoria.'),
});

type CellphoneFormValues = z.infer<typeof cellphoneSchema>;
type AccessoryFormValues = z.infer<typeof accessorySchema>;

const defaultCommonValues = {
  brand: '',
  model: '',
  color: '',
  salePrice: 0,
  stock: 0,
  description: '',
  costPrice: 0,
  discount: 0,
  shipping: false,
  installments: 0,
  installmentPrice: 0,
};

const defaultCellphoneValues: Partial<CellphoneFormValues> = {
  ...defaultCommonValues,
  imei: '',
  dataTecnica: [],
};

const defaultAccessoryValues: Partial<AccessoryFormValues> = {
  ...defaultCommonValues,
  category: '',
};

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [productType, setProductType] = useState('celular');
  const [files, setFiles] = useState<File[]>([]);
  const [marcas, setMarcas] = useState<{ id: string; nombre: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const form = useForm<CellphoneFormValues | AccessoryFormValues>({
    resolver: (data, context, options) => {
      const schema = productType === 'celular' ? cellphoneSchema : accessorySchema;
      return zodResolver(schema)(data, context, options);
    },
    defaultValues: defaultCellphoneValues,
  });
  
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const marcasData = await getMarcas();
        setMarcas(marcasData);
      } catch (error) {
        toast({
          title: 'Error de Carga',
          description: 'No se pudieron cargar las marcas.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [toast]);


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
    
    let finalData = { ...data };
    if (productType === 'celular' && 'dataTecnica' in finalData && Array.isArray(finalData.dataTecnica)) {
        const specsObject = finalData.dataTecnica.reduce((acc: any, { key, value }) => {
            if (key) acc[key] = value;
            return acc;
        }, {});
        // @ts-ignore
        finalData.dataTecnica = specsObject;
    }

    const payload = { ...finalData, files };

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
             {isLoading ? (
                <div>Cargando...</div>
              ) : (
              <div className="grid gap-6">
                <ProductDetailsFields control={form.control} productType={productType} marcas={marcas} />
                <Separator />
                <ProductPricingFields control={form.control} />
                 <Separator />
                <ProductFinancingFields control={form.control} />
                 <Separator />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ProductIdentificationFields 
                      control={form.control} 
                      productType={productType} 
                      newFiles={files} 
                      existingImageUrls={[]}
                      handleFiles={handleFiles} 
                      removeNewFile={removeFile}
                      removeExistingFile={() => {}}
                    />
                     <ProductShippingFields control={form.control} />
                </div>
                <Separator />
                <ProductDescriptionField control={form.control} />
                {productType === 'celular' && (
                  <ProductdataTecnicaField control={form.control} />
                )}
              </div>
              )}
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
