'use client';

import { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, Search } from 'lucide-react';

import type { Order } from '@/lib/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';


// --- Helper para dar formato a la moneda ---
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
  }).format(amount);
};

// --- Helper para dar estilo a los estados ---
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'accredited':
      return 'secondary';
    case 'rejected':
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

interface SalesTableProps {
    initialOrders: Order[];
}

export function SalesTable({ initialOrders }: SalesTableProps) {
  const [orders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentData, setSelectedPaymentData] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleShowDetails = (paymentData: any) => {
    setSelectedPaymentData(paymentData);
    setIsModalOpen(true);
  };

  // --- Filtrado de órdenes por término de búsqueda ---
  const filteredOrders = useMemo(() => orders.filter(
    (order) =>
      order.payer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment_id.toString().includes(searchTerm.toLowerCase()) ||
      (order.items && order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())))
  ), [orders, searchTerm]);

  // --- Cálculo del total de ventas aprobadas ---
  const totalSales = useMemo(() => filteredOrders
    .filter(order => order.status.toLowerCase() === 'approved' || order.status.toLowerCase() === 'accredited')
    .reduce((sum, order) => sum + order.amount, 0), [filteredOrders]);

  return (
    <>
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Todas las transacciones de Mercado Pago.</p>
          <p className="mt-1 font-medium">
            Total Aprobado: {formatCurrency(totalSales, 'ARS')}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por email, ID de pago, producto..."
            className="pl-8 sm:w-[300px] md:w-[400px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de ventas */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.payer_email}</TableCell>
                  
                  <TableCell>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        {item.title} (x{item.quantity})
                      </div>
                    ))}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {isClient && order.date_approved ? new Date(order.date_approved).toLocaleDateString('es-ES') : new Date(order.created_at).toISOString().split('T')[0]}
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {formatCurrency(order.amount, order.currency)}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleShowDetails(order.payment_data)}>
                          Ver detalle del pago
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const email = order.payer_email;
                            try {
                              window.open(`https://mail.google.com/mail/?view=cm&to=${email}`);
                            } catch {
                              window.location.href = `mailto:${email}`;
                            }
                          }}
                        >
                          Enviar email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{filteredOrders.length}</strong> de <strong>{orders.length}</strong> ventas.
          </div>
        </CardFooter>
      </Card>
      
      {/* Modal para detalles de pago */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle Completo de la Venta</DialogTitle>
            <DialogDescription>
              A continuación se muestra el objeto JSON completo recibido de Mercado Pago.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] rounded-md border p-4">
            <pre className="text-sm">
              {JSON.stringify(selectedPaymentData, null, 2)}
            </pre>
          </ScrollArea>
           <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
