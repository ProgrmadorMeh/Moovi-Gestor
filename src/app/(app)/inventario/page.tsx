'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { getAllProductsCached } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { InventoryTable } from '@/components/inventory-table';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { ExportExcelButton } from '@/components/forms/exel/exel-button';
import { ExcelUpload } from '@/components/forms/exel/ExcelUpload';


export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const initialProducts = await getAllProductsCached(true); // Forzar refresh
    setProducts(initialProducts);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
          <p className="text-muted-foreground">
            Gestiona celulares y accesorios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExcelUpload onUploadSuccess={fetchProducts} />
          <ExportExcelButton 
            data={products}
            fileName="inventario"
            sheetName="Productos"
          />
          <Link href="/inventario/nuevo">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Producto
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <InventoryTable initialProducts={products} onProductDeleted={fetchProducts} />
      )}
    </div>
  );
}
