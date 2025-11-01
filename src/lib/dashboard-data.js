'use server';

import { createServerClient } from '@/lib/supabaseServer';
import { cache } from 'react';

// --- Helpers ---
const getThirtyDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
};

/**
 * Esta es una función de carga de datos optimizada y cacheada para el Dashboard.
 * Realiza consultas específicas y eficientes para obtener solo los datos necesarios.
 */
export const getDashboardPageData = cache(async () => {
  const supabase = createServerClient();
  const thirtyDaysAgo = getThirtyDaysAgo();

  // Realizamos todas las consultas a la base de datos en paralelo
  const [
    lowStockCelularesRes,
    lowStockAccesoriosRes,
    recentSalesRes,
    salesDataRes,
  ] = await Promise.all([
    // 1. Pedimos celulares con bajo stock.
    supabase
      .from('celulares')
      .select('id, model, stock, brand, color')
      .gt('stock', 0)
      .lt('stock', 10),
    // 2. Pedimos accesorios con bajo stock.
    supabase
      .from('accesorios')
      .select('id, model, stock, brand, color')
      .gt('stock', 0)
      .lt('stock', 10),
    // 3. Obtenemos las 5 ventas más recientes.
    supabase
      .from('orders')
      .select('id, created_at, payer_email, status, amount')
      .order('created_at', { ascending: false })
      .limit(5),
    // 4. Obtenemos los datos de ventas para las métricas y el gráfico.
    supabase
      .from('orders')
      .select('amount, status, date_approved')
      .filter('status', 'in', '("approved","accredited")')
      .gte('date_approved', thirtyDaysAgo),
  ]);

  // --- Procesamiento de Datos ---
  // Combinamos productos de ambas tablas.
  const lowStockCelulares = lowStockCelularesRes.data || [];
  const lowStockAccesorios = lowStockAccesoriosRes.data || [];
  const lowStockProducts = [...lowStockCelulares, ...lowStockAccesorios].map(p => ({
    ...p,
    brand: p.brand || 'Sin Marca',
  }));

  const recentSales = recentSalesRes.data || [];
  const salesData = salesDataRes.data || [];

  // Métricas
  const totalRevenue = salesData.reduce((sum, order) => sum + order.amount, 0);
  const newSalesToday = salesData.filter(o => o.date_approved && o.date_approved.startsWith(new Date().toISOString().split('T')[0])).length;

  // Datos del Gráfico
  const salesByDay = salesData.reduce((acc, order) => {
    if (order.date_approved) {
        const date = order.date_approved.split('T')[0];
        acc[date] = (acc[date] || 0) + order.amount;
    }
    return acc;
  }, {});

  const chartData = Object.keys(salesByDay)
    .map(date => ({ date, sales: salesByDay[date] }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Retornamos un objeto único con todos los datos que la página necesita
  return {
    totalRevenue,
    totalSalesCount: salesData.length,
    lowStockProducts,
    newSalesToday,
    recentSales,
    chartData,
    errors: {
      products: lowStockCelularesRes.error || lowStockAccesoriosRes.error,
      recentSales: recentSalesRes.error,
      salesData: salesDataRes.error,
    },
  };
});
