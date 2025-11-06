'use client';

import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import { getAllProductsCached } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { InventoryTable } from '@/components/inventory-table';
import { useEffect, useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, Cellphone } from '@/lib/types';
import { ExportExcelButton } from '@/components/forms/exel/exel-button';
import { ExcelUpload } from '@/components/forms/exel/ExcelUpload';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


function isCellphone(product: Product): product is Cellphone {
  return 'imei' in product;
}

export default function InventoryPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const initialProducts = await getAllProductsCached();
      setAllProducts(initialProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Optionally, show a toast or error message to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleActionSuccess = () => {
    startTransition(() => {
      // This will re-run the server-side fetching and update the page.
      // Next.js will cleverly re-use the layout.
      router.refresh(); 
      // After refresh, we can optionally re-fetch client-side data if needed,
      // but router.refresh should handle most cases with Server Components.
      fetchProducts();
    });
  };

  const filteredProducts = useMemo(() => {
    let products = allProducts;

    if (activeTab === 'cellphones') {
      products = products.filter(isCellphone);
    } else if (activeTab === 'accessories') {
      products = products.filter(p => !isCellphone(p));
    }

    if (searchTerm) {
      products = products.filter(p => 
        p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return products;
  }, [searchTerm, activeTab, allProducts]);


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
          <ExcelUpload onUploadSuccess={handleActionSuccess} />
          <ExportExcelButton 
            data={filteredProducts}
            fileName={`inventario_${activeTab}`}
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

       <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="cellphones">Celulares</TabsTrigger>
            <TabsTrigger value="accessories">Accesorios</TabsTrigger>
          </TabsList>
          
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por modelo, marca..."
              className="pl-8 w-full sm:w-[300px] md:w-[400px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all">
            <InventoryTable 
              products={filteredProducts} 
              onProductDeleted={handleActionSuccess} 
              isLoading={loading || isPending}
              totalProducts={allProducts.length}
            />
        </TabsContent>
        <TabsContent value="cellphones">
            <InventoryTable 
              products={filteredProducts} 
              onProductDeleted={handleActionSuccess} 
              isLoading={loading || isPending}
              totalProducts={allProducts.length}
            />
        </TabsContent>
        <TabsContent value="accessories">
            <InventoryTable 
              products={filteredProducts} 
              onProductDeleted={handleActionSuccess} 
              isLoading={loading || isPending}
              totalProducts={allProducts.length}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
