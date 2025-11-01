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
  const [lowStockProductsRes, recentSalesRes, salesDataRes] = await Promise.all([
    // 1. OPTIMIZACIÓN: Pedimos a la DB solo los productos con bajo stock.
    supabase
      .from('celulares')
      .select('id, model, stock, marcas(nombre), color')
      .gt('stock', 0)
      .lt('stock', 10),

    // 2. Obtenemos solo las 5 ventas más recientes (esto ya es eficiente)
    supabase
      .from('orders')
      .select('id, created_at, payer_email, status, amount')
      .order('created_at', { ascending: false })
      .limit(5),

    // 3. Obtenemos los datos de ventas para las métricas y el gráfico (esto ya es eficiente)
    supabase
      .from('orders')
      .select('amount, status, date_approved')
      .filter('status', 'in', '("approved","accredited")')
      .gte('date_approved', thirtyDaysAgo),
  ]);

  // --- Procesamiento de Datos ---
  // Procesamos los productos para crear la propiedad `brand`.
  const rawLowStockProducts = lowStockProductsRes.data || [];
  const lowStockProducts = rawLowStockProducts.map(p => ({
    ...p,
    brand: p.marcas?.nombre || 'Sin Marca',
  }));

  const recentSales = recentSalesRes.data || [];
  const salesData = salesDataRes.data || [];

  // Métricas
  const totalRevenue = salesData.reduce((sum, order) => sum + order.amount, 0);
  const newSalesToday = salesData.filter(o => o.date_approved && o.date_approved.startsWith(new Date().toISOString().split('T')[0])).length;
  // `lowStockProducts` ya es la lista que necesitamos, no hay que filtrar más.

  // Datos del Gráfico
  const salesByDay = salesData.reduce((acc, order) => {
    const date = order.date_approved.split('T')[0];
    acc[date] = (acc[date] || 0) + order.amount;
    return acc;
  }, {});

  const chartData = Object.keys(salesByDay)
    .map(date => ({ date, sales: salesByDay[date] }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Retornamos un objeto único con todos los datos que la página necesita
  return {
    totalRevenue,
    totalSalesCount: salesData.length,
    lowStockProducts, // Ya está calculada eficientemente
    newSalesToday,
    recentSales,
    chartData,
    errors: {
      products: lowStockProductsRes.error,
      recentSales: recentSalesRes.error,
      salesData: salesDataRes.error,
    },
  };
});
