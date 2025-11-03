'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';

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
import { methodPut } from '@/lib/functions/metodos/methodPut';
import { methodGetById } from '@/lib/functions/metodos/methodGetById';
import { methodPost } from '@/lib/functions/metodos/methodPost';
import type { Product } from '@/lib/types';


// --- Importamos los componentes del formulario ---
import { ProductDetailsFields } from '@/components/forms/product/ProductDetailsFields';
import { ProductPricingFields } from '@/components/forms/product/ProductPricingFields';
import { ProductIdentificationFields } from '@/components/forms/product/ProductIdentificationFields';
import { ProductDescriptionField } from '@/components/forms/product/ProductDescriptionField';

// --- Esquemas ---
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

type FormValues = z.infer<typeof cellphoneSchema> | z.infer<typeof accessorySchema>;

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [slug] = useState(params.slug || []);
  const [productType, setProductType] = useState<'celular' | 'accesorio' | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Un estado para los archivos nuevos y otro para los existentes
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const [type, id] = slug;
    if ((type === 'celular' || type === 'accesorio') && id) {
      setProductType(type);
      setProductId(id);
      setIsEditMode(true);
    } else if (type === 'celular' || type === 'accesorio') {
       setProductType(type as 'celular' | 'accesorio');
       setIsEditMode(false);
       setIsLoading(false);
    } else {
        // Redirigir o mostrar un error si el slug no es válido
        router.push('/inventario');
    }
  }, [slug, router]);

  const form = useForm<FormValues>({
    resolver: (data, context, options) => {
      const schema = productType === 'celular' ? cellphoneSchema : accessorySchema;
      return zodResolver(schema)(data, context, options);
    },
    // Valores por defecto para evitar errores de uncontrolled/controlled
    defaultValues: {
        brand: '', model: '', color: '', salePrice: 0, stock: 0, description: '', imei: '',
        capacity: '', category: ''
    }
  });

  useEffect(() => {
    if (isEditMode && productType && productId) {
      const fetchProductData = async () => {
        setIsLoading(true);
        const tableName = productType === 'celular' ? 'celulares' : 'accesorios';
        const result = await methodGetById(tableName, productId);
        
        if (result.success && result.data) {
          const productData = {
            ...result.data,
            brand: result.data.nombre_marca, // Mapear nombre_marca a brand
          };
          form.reset(productData);

          // Guardar las URLs de las imágenes existentes
          if (productData.imageUrl && Array.isArray(productData.imageUrl)) {
            setExistingImageUrls(productData.imageUrl);
          } else if (productData.imageUrl && typeof productData.imageUrl === 'string') {
             try {
                const parsed = JSON.parse(productData.imageUrl);
                setExistingImageUrls(Array.isArray(parsed) ? parsed : [productData.imageUrl]);
            } catch {
                setExistingImageUrls([productData.imageUrl]);
            }
          }

        } else {
          toast({
            title: 'Error',
            description: `No se pudo encontrar el producto. ${result.message}`,
            variant: 'destructive',
          });
          router.push('/inventario');
        }
        setIsLoading(false);
      };
      fetchProductData();
    } else if (!isEditMode && productType) {
        form.reset();
    }
  }, [isEditMode, productType, productId, form, router, toast]);

  const handleFiles = (filesToAdd: FileList | null) => {
    if (!filesToAdd) return;
    const combined = [...newFiles, ...Array.from(filesToAdd)];
    const totalImageCount = combined.length + existingImageUrls.length;
    
    if (totalImageCount > 4) {
      toast({
        title: 'Límite de imágenes',
        description: 'No puedes tener más de 4 imágenes en total.',
        variant: 'destructive'
      });
      return;
    }
    setNewFiles(combined);
    form.setValue('imageUrl', combined); // Actualiza el form por si se usa en la validación
  };

  const removeNewFile = (index: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    form.setValue('imageUrl', updatedFiles);
  };
  
  const removeExistingFile = (urlToRemove: string) => {
    const updatedUrls = existingImageUrls.filter(url => url !== urlToRemove);
    setExistingImageUrls(updatedUrls);
    // Aquí podrías querer una lógica para marcar esta imagen para ser eliminada en el backend
  };


  async function onSubmit(data: FormValues) {
    if (!productType) return;
    
    const endpoint = productType === 'celular' ? 'celulares' : 'accesorios';
    let resp;

    // Lógica para no sobreescribir imágenes si no se suben nuevas
    const payload = { ...data, id: productId };
    if (newFiles.length > 0) {
      // @ts-ignore
      payload.files = newFiles; 
    }
    
    // @ts-ignore
    payload.imageUrl = existingImageUrls;

    if (isEditMode) {
      resp = await methodPut(endpoint, payload);
    } else {
      // @ts-ignore
      payload.files = newFiles;
      resp = await methodPost(payload, endpoint);
    }

    toast({
      title: resp.success ? `Producto ${isEditMode ? 'Actualizado' : 'Guardado'}` : 'Error',
      description: resp.message,
      variant: resp.success ? 'default' : 'destructive',
    });

    if (resp.success) router.push('/inventario');
  }

  if (isLoading) {
    return <div>Cargando datos del producto...</div>;
  }
  
  if (!productType) {
    return <div>Tipo de producto no válido.</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto grid max-w-5xl flex-1 auto-rows-max gap-4">
          <div className="flex justify-center">
             <Tabs value={productType} onValueChange={(val) => !isEditMode && router.push(`/inventario/editar/${val}/${productId || ''}`)}>
              <TabsList>
                <TabsTrigger value="celular" disabled={isEditMode && productType !== 'celular'}>Celular</TabsTrigger>
                <TabsTrigger value="accesorio" disabled={isEditMode && productType !== 'accesorio'}>Accesorio</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? 'Editar' : 'Cargar Nuevo'} {productType === 'celular' ? 'Celular' : 'Accesorio'}</CardTitle>
              <CardDescription>
                {isEditMode ? 'Modifica' : 'Ingresa'} los detalles del producto. Los campos con * son obligatorios.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6">
                <ProductDetailsFields control={form.control} productType={productType} />
                <ProductPricingFields control={form.control} />
                <ProductIdentificationFields 
                  control={form.control} 
                  productType={productType} 
                  newFiles={newFiles}
                  existingImageUrls={existingImageUrls}
                  handleFiles={handleFiles} 
                  removeNewFile={removeNewFile}
                  removeExistingFile={removeExistingFile}
                />
                <ProductDescriptionField control={form.control} />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/inventario">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Producto' : 'Guardar Producto')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
