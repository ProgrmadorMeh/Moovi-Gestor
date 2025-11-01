'use server';

import { supabase } from '../../src/lib/supabaseClient';
import { cache } from 'react';
import { getAllProductsCached } from './data';

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
  const thirtyDaysAgo = getThirtyDaysAgo();

  // Realizamos todas las consultas a la base de datos en paralelo
  const [
    allProducts,
    recentSalesRes,
    salesDataRes,
  ] = await Promise.all([
    // 1. Obtenemos TODOS los productos usando la función centralizada.
    getAllProductsCached(true), // true para forzar refresh y tener datos frescos
    // 2. Obtenemos las 5 ventas más recientes.
    supabase
      .from('orders')
      .select('id, created_at, payer_email, status, amount')
      .order('created_at', { ascending: false })
      .limit(5),
    // 3. Obtenemos los datos de ventas para las métricas y el gráfico.
    supabase
      .from('orders')
      .select('amount, status, date_approved')
      .filter('status', 'in', '("approved","accredited")')
      .gte('date_approved', thirtyDaysAgo),
  ]);

  // --- Procesamiento de Datos ---
  // Filtramos productos con bajo stock desde la lista completa.
  const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock < 10);

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
      products: null, // Ya no hay error de productos separado
      recentSales: recentSalesRes.error,
      salesData: salesDataRes.error,
    },
  };
});