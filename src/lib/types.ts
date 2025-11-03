// lib/types.ts

// Campos base que todos los productos comparten.
type BaseProduct = {
  id: string;
  model: string;
  description: string;
  salePrice: number;
  originalPrice?: number; // Es opcional, solo existe si hay descuento.
  discount: number;
  stock: number;
  brand: string;
  imageUrl: string | string[] | null; // <-- Acepta una URL, un array de URLs o null
  shipping: boolean;
  installments: number;
  color: string;
};

// Tipo específico para celulares, extiende la base y añade sus propios campos.
export type Cellphone = BaseProduct & {
  imei: string;
  capacity: string;
  // Excluimos campos de accesorios para evitar solapamientos.
  category?: never;
};

// Tipo específico para accesorios.
export type Accessory = BaseProduct & {
  category: string;
  // Excluimos campos de celulares.
  imei?: never;
  capacity?: never;
};

// El tipo `Product` es una unión de `Cellphone` o `Accessory`.
// Esto permite que un producto sea uno u otro, pero no ambos.
export type Product = Cellphone | Accessory;

// --- TIPOS DE VENTAS (ORDERS) ---

export type OrderItem = {
  title: string;
  quantity: number;
  unit_price: number;
};

export type Order = {
  id: string; // ID del pedido en nuestra DB
  payment_id: string; // ID del pago en Mercado Pago
  status: string;
  amount: number;
  currency: string;
  payer_email: string;
  payment_method: string;
  date_approved: string;
  created_at: string;
  items: OrderItem[];
  payment_data: any; // Datos completos de la transacción
};

// --- VALORES POR DEFECTO ---

// Objeto base con valores por defecto para todos los campos posibles.
// Ayuda a prevenir errores de "undefined" en el renderizado.
export const defaultBase = {
  id: "0",
  model: "Sin especificar",
  description: "Sin descripción.",
  salePrice: 0,
  originalPrice: undefined,
  discount: 0,
  stock: 0,
  brand: "Marca Desconocida",
  imageUrl: "https://pwxpxouatzzxvvvszdnx.supabase.co/storage/v1/object/public/celImagen/place.jpg",
  shipping: false,
  installments: 0,
  color: "No especificado",
  // Campos específicos con valores por defecto
  imei: "N/A",
  capacity: "N/A",
  category: "General",
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Vendedor';
  last_sign_in_at: string;
  avatarUrl?: string;
};
