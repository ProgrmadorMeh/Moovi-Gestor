'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "@/components/sales-chart";
import { getDashboardPageData } from "@/lib/dashboard-data";
import { DollarSign, Package, PackageCheck, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import type { Order, Product } from "@/lib/types";
import { ExportExcelButton } from "@/components/forms/exel/exel-button";

// --- Helpers ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

const getStatusVariant = (status: string) => {
  const s = status ? status.toLowerCase() : '';
  if (s === 'approved' || s === 'accredited') return 'secondary';
  if (s === 'rejected' || s === 'cancelled') return 'destructive';
  return 'outline';
};

export default function DashboardPage() {
  const [data, setData] = useState<{
    totalRevenue: number;
    totalSalesCount: number;
    lowStockProducts: Product[];
    newSalesToday: number;
    recentSales: Order[];
    chartData: { date: string; sales: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getDashboardPageData();
        if (result.errors.products || result.errors.recentSales || result.errors.salesData) {
          console.error('Error al cargar datos del dashboard:', {
            products: result.errors.products,
            sales: result.errors.recentSales,
            chart: result.errors.salesData,
          });
          setErrorState('Algunos componentes no se pudieron cargar. La base de datos puede no estar disponible.');
        }
        setData(result);
      } catch (err: any) {
        setErrorState(err.message || 'Error de conexión.');
        setData(null); // Asegurarse que no haya datos viejos
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Moovi: La eficiencia se mueve contigo.</p>
      </header>

      {errorState && !loading && (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Atención</CardTitle>
                <CardDescription className="text-destructive">
                    {errorState}
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      {/* Tarjetas de métricas */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos (30 días)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">Cargando...</div> :
             data ? <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div> :
             <div className="text-sm text-destructive">No disponible</div>
            }
            <p className="text-xs text-muted-foreground">Ventas aprobadas en los últimos 30 días.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos (30 días)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">Cargando...</div> :
             data ? <div className="text-2xl font-bold">+{data.totalSalesCount}</div> :
             <div className="text-sm text-destructive">No disponible</div>
            }
            <p className="text-xs text-muted-foreground">Pedidos aprobados en los últimos 30 días.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos por Agotarse</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <div className="text-2xl font-bold">Cargando...</div> :
             data ? <div className="text-2xl font-bold">{data.lowStockProducts.length}</div> :
             <div className="text-sm text-destructive">No disponible</div>
            }
            <p className="text-xs text-muted-foreground">Con menos de 10 unidades.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Ventas (Hoy)</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">Cargando...</div> :
             data ? <div className="text-2xl font-bold">+{data.newSalesToday}</div> :
             <div className="text-sm text-destructive">No disponible</div>
            }
            <p className="text-xs text-muted-foreground">Pedidos aprobados hoy.</p>
          </CardContent>
        </Card>
      </section>

      {/* Gráfico y ventas recientes */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          {loading ? <Card><CardHeader><CardTitle>Cargando gráfico...</CardTitle></CardHeader><CardContent className="h-64"/></Card> :
           data && data.chartData ? <SalesChart data={data.chartData} /> : 
           <Card><CardHeader><CardTitle className="text-destructive">Gráfico no disponible</CardTitle></CardHeader><CardContent className="h-64"/></Card>
          }
        </div>

        <Card className="lg:col-span-3">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Ventas Recientes</CardTitle>
              <CardDescription>Las últimas 5 transacciones de la tienda.</CardDescription>
            </div>
            <ExportExcelButton 
              data={data?.recentSales || []} 
              fileName="ventas_recientes"
              sheetName="Ventas"
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={3} className="text-center">Cargando...</TableCell></TableRow> :
                 data && data.recentSales && data.recentSales.length > 0 ? (
                  data.recentSales.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.payer_email || "No disponible"}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString('es-AR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No hay ventas recientes o no se pudieron cargar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Productos con bajo stock */}
      <Card>
        <CardHeader>
          <CardTitle>Productos por Agotarse</CardTitle>
          <CardDescription>Estos productos tienen 10 unidades o menos en stock.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={2} className="text-center">Cargando...</TableCell></TableRow> :
               data && data.lowStockProducts && data.lowStockProducts.length > 0 ? (
                data.lowStockProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.brand} {product.model}</div>
                      <div className="text-sm text-muted-foreground">{product.color}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{product.stock}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No hay productos con bajo stock o no se pudieron cargar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
