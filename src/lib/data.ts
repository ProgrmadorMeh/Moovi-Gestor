import { methodGetList } from "@/lib/functions/metodos/methodGetList";
import type { Cellphone, Accessory, Product, Order, OrderItem, User } from "@/lib/types";
import { supabase } from './supabaseClient';
import { cache } from 'react';

// --- CACHE (Module-level cache removed for more reliable Next.js caching) ---
// let cachedAllProducts: Product[] | null = null; // REMOVED
let cachedOrders: Order[] | null = null;
let cachedUsers: User[] | null = null;
let cachedMarcas: { id: string; nombre: string }[] | null = null;


/**
 * Procesa una lista de productos para asegurar que la lógica de precios y marcas sea consistente.
 */
function processProducts(products: any[]): Product[] {
  return products.map(p => {
    const basePrice = Number(p.salePrice) || 0;
    const discount = Number(p.discount) || 0;
    
    // CORRECCIÓN: Acceder correctamente al nombre de la marca anidado.
    const brand = (p.marcas && p.marcas.nombre) ? p.marcas.nombre : 'Sin Marca';

    let finalSalePrice = basePrice;
    let originalPrice: number | undefined = undefined;

    if (discount > 0) {
      originalPrice = basePrice;
      finalSalePrice = basePrice * (1 - discount / 100);
    }
    
    return {
      ...p,
      salePrice: finalSalePrice,
      originalPrice: originalPrice,
      discount,
      brand, 
    };
  });
}

/**
 * Obtiene todos los productos combinados (celulares + accesorios) con cache
 * y aplica la lógica de precios y marcas correcta.
 * Usamos la función `cache` de React para un cacheo de request más fiable.
 */
export const getAllProductsCached = cache(async (): Promise<Product[]> => {
  const results = await Promise.all([
    methodGetList("celulares"),
    methodGetList("accesorios"),
  ]);

  const cellphonesRes = results[0];
  const accessoriesRes = results[1];

  const allProductsRaw = [
    ...(Array.isArray(cellphonesRes.data) ? cellphonesRes.data : []) as any[],
    ...(Array.isArray(accessoriesRes.data) ? accessoriesRes.data : []) as any[],
  ];

  const processed = processProducts(allProductsRaw);
  
  return processed;
});


/**
 * Obtiene solo celulares, ya procesados.
 */
export async function getCellphonesCached(refresh = false): Promise<Cellphone[]> {
  const allProducts = await getAllProductsCached();
  return allProducts.filter((p): p is Cellphone => "imei" in p);
}

/**
 * Obtiene solo accesorios, ya procesados.
 */
export async function getAccessoriesCached(refresh = false): Promise<Accessory[]> {
  const allProducts = await getAllProductsCached();
  return allProducts.filter((p): p is Accessory => "category" in p);
}

/**
 * Obtiene y procesa las órdenes desde Supabase, con cache.
 * @param refresh - Si es true, fuerza la recarga de datos.
 */
export async function getOrders(refresh = false): Promise<Order[]> {
  if (!refresh && cachedOrders) {
    return cachedOrders;
  }

  const { data, success, message } = await methodGetList('orders');

  if (!success) {
    console.error("Error al obtener las órdenes:", message);
    return [];
  }

  const processedOrders = data.map((order: any): Order => {
    let paymentData = null;
    try {
        paymentData = typeof order.payment_data === 'string' 
            ? JSON.parse(order.payment_data) 
            : order.payment_data;
    } catch(e) {
        console.error(`Error parsing payment_data for order ${order.id}:`, e);
        paymentData = { error: "Could not parse JSON data." };
    }
    

    const items: OrderItem[] = paymentData?.additional_info?.items?.map((item: any) => ({
      title: item.title || 'Producto sin nombre',
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
    })) || [];

    return {
      id: order.id,
      payment_id: order.payment_id,
      status: order.status,
      amount: Number(order.amount) || 0,
      currency: order.currency,
      payer_email: order.payer_email,
      payment_method: order.payment_method,
      date_approved: order.date_approved,
      created_at: order.created_at,
      items: items,
      payment_data: paymentData
    };
  });

  cachedOrders = processedOrders;
  return processedOrders;
}

/**
 * Obtiene los usuarios desde Supabase, con cache.
 * @param refresh - Si es true, fuerza la recarga de datos.
 */
export async function getUsers(refresh = false): Promise<User[]> {
  if (!refresh && cachedUsers) {
    return cachedUsers;
  }

  const { data, success, message } = await methodGetList('user');

  if (!success) {
    console.error("Error al obtener los usuarios:", message);
    return [];
  }

  cachedUsers = data as User[];
  return cachedUsers;
}

export const getMarcas = cache(async (): Promise<{ id: string; nombre: string }[]> => {
  const { data, error } = await supabase
    .from('marcas')
    .select('id, nombre');
  
  if (error) {
    console.error("Error fetching marcas:", error);
    return [];
  }

  return data;
});
