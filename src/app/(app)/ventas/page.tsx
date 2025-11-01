'use client';

import { getOrders } from '@/lib/data';
import { SalesTable } from '@/components/sales-table';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { ExportExcelButton } from '@/components/forms/exel/exel-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const initialOrders = await getOrders(true); // forzar refresh
      setOrders(initialOrders);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex-1">
          Historial de Ventas
        </h2>
        <div className="flex items-center gap-2">
          <ExportExcelButton 
            data={orders}
            fileName="historial_ventas"
            sheetName="Ventas"
          />
          <Link href="/ventas/nueva" passHref>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Cargando ventas...</p>
      ) : (
        <SalesTable initialOrders={orders} />
      )}
    </div>
  );
}
