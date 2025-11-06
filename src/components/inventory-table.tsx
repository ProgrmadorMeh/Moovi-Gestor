'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

import { methodDelete } from '@/lib/functions/metodos/methodDelete';
import type { Product, Cellphone, Accessory } from '@/lib/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


// --- Helper para obtener la URL de la imagen ---
const getDisplayImage = (imageUrl: string | string[] | null): string => {
  const fallback = "https://pwxpxouatzzxvvvszdnx.supabase.co/storage/v1/object/public/celImagen/place.jpg";

  if (!imageUrl) return fallback;

  try {
    // Caso 1: Es un array de strings real
    if (Array.isArray(imageUrl)) {
      return imageUrl.length > 0 ? imageUrl[0] : fallback;
    }

    // Caso 2: Es un string (puede ser una URL o un JSON)
    if (typeof imageUrl === 'string') {
      // Si parece un array JSON, lo parseamos
      if (imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
        const parsed = JSON.parse(imageUrl);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0] || fallback;
        }
      }
      // Si es una URL simple y no está vacía
      if (imageUrl.length > 0 && !imageUrl.startsWith('[')) {
        return imageUrl;
      }
    }
  } catch (error) {
    console.error("Error al procesar imageUrl:", imageUrl, error);
  }

  return fallback;
};


// --- Helper para identificar el tipo de producto ---
function isCellphone(product: Product): product is Cellphone {
  return 'imei' in product;
}

interface InventoryTableProps {
  products: Product[];
  onProductDeleted: () => void;
  isLoading: boolean;
  totalProducts: number;
}

export function InventoryTable({ products, onProductDeleted, isLoading, totalProducts }: InventoryTableProps) {
  
  // --- Eliminación de un producto ---
  const handleDelete = async (id: string, model: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${model}"?`)) return;

    // Identificar si es celular o accesorio para la tabla correcta
    const product = products.find(p => p.id === id);
    const tabla = isCellphone(product!) ? 'celulares' : 'accesorios';

    try {
      const resp = await methodDelete({ tabla, id });
      if (!resp.success) throw new Error(resp.message);
      
      alert('✅ Producto eliminado.');
      onProductDeleted(); // Llamar a la función para refrescar la lista.

    } catch (err: any) {
      console.error('Error al eliminar:', err);
      alert(`❌ No se pudo eliminar: ${err.message}`);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[80px] sm:table-cell">Imagen</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="hidden md:table-cell">Precio</TableHead>
              <TableHead className="hidden md:table-cell">Tipo / Categoría</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">Cargando productos...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
               <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No se encontraron productos.</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  
                  {/* Columna de Imagen */}
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      src={getDisplayImage(product.imageUrl)}
                      alt={`Imagen de ${product.model}`}
                      width={64}
                      height={64}
                      className="rounded-md object-cover aspect-square"
                    />
                  </TableCell>

                  {/* Columna de Producto y Marca */}
                  <TableCell className="font-medium">
                    <div>{product.brand} {product.model}</div>
                    <div className="text-sm text-muted-foreground">Color: {product.color}</div>
                  </TableCell>
                  
                  {/* Columna de Stock */}
                  <TableCell>
                    <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                      {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                    </Badge>
                  </TableCell>

                  {/* Columna de Precio */}
                  <TableCell className="hidden md:table-cell">
                    {product.discount > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-red-500 font-bold">
                          ${product.salePrice.toLocaleString('es-ES')}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          ${product.originalPrice?.toLocaleString('es-ES')}
                        </span>
                      </div>
                    ) : (
                      `$${product.salePrice.toLocaleString('es-ES')}`
                    )}
                  </TableCell>

                  {/* Columna de Tipo/Categoría */}
                  <TableCell className="hidden md:table-cell">
                    {isCellphone(product) ? (
                      <Badge variant="outline">Celular</Badge>
                    ) : (
                      <Badge variant="default">{(product as Accessory).category}</Badge>
                    )}
                  </TableCell>

                  {/* Columna de Acciones */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/inventario/editar/${isCellphone(product) ? 'celular' : 'accesorio'}/${product.id}`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          onClick={() => handleDelete(product.id, product.model)}>
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>{products.length}</strong> de <strong>{totalProducts}</strong> productos.
        </div>
      </CardFooter>
    </Card>
  );
}
