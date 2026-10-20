// =============================================================================
// Dido Store — TypeScript Types
// =============================================================================

export interface Category {
  id: number;
  name_en: string;
  name_ar: string | null;
  slug: string;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  name_en: string;
  name_ar: string | null;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  selling_price: number;
  discount_price: number | null;
  cost_price: number;
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  category?: Category;
  images?: ProductImage[];
  effective_price?: number;
  is_on_sale?: boolean;
  discount_percentage?: number | null;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  whatsapp_number: string | null;
  tiktok_username: string | null;
  instagram_username: string | null;
  source_platform: 'whatsapp' | 'tiktok' | 'instagram';
  orders_count?: number;
  orders?: Order[];
  deposits?: Deposit[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  line_total: number;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  customs_fee: number;
  discount_amount: number;
  total: number;
  shipping_address: string | null;
  notes: string | null;
  customer?: Customer;
  items?: OrderItem[];
  deposits?: Deposit[];
  status_history?: OrderStatusHistory[];
  customs_fee_history?: CustomsFeeHistory[];
  remaining_balance?: number;
  verified_deposits_amount?: number;
  can_contact?: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ordered_from_shein'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Deposit {
  id: number;
  order_id: number;
  customer_id: number;
  amount: number;
  method: 'instapay' | 'vodafone_cash' | 'telda';
  transfer_date: string;
  screenshot_path: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_note: string | null;
  verified_by: number | null;
  verified_at: string | null;
  order?: Order;
  customer?: Customer;
  verifier?: { id: number; name: string };
  created_at: string;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: number | null;
  note: string | null;
  changed_by_user?: { id: number; name: string };
  created_at: string;
}

export interface CustomsFeeHistory {
  id: number;
  order_id: number;
  old_amount: number;
  new_amount: number;
  changed_by: number;
  reason: string | null;
  changed_by_user?: { id: number; name: string };
  created_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string | null;
  group: string;
}

export interface FounderProfile {
  id: number;
  company_name_en: string;
  company_name_ar: string;
  founder_name_en: string;
  founder_name_ar: string;
  bio_en: string | null;
  bio_ar: string | null;
  photo_path: string | null;
}

export interface Analytics {
  kpis: {
    total_orders: number;
    total_revenue: number;
    total_cost: number;
    net_profit: number;
    total_customs_fees: number;
    total_deposits: number;
    outstanding_balances: number;
  };
  orders_by_status: Record<string, number>;
  orders_over_time: { date: string; count: number }[];
  revenue_vs_profit: { date: string; revenue: number; profit: number }[];
  best_selling_products: {
    product_id: number;
    product_name: string;
    total_sold: number;
    total_revenue: number;
  }[];
  best_categories: {
    id: number;
    name_en: string;
    total_sold: number;
    total_revenue: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PublicSettings {
  contact: Record<string, string>;
  payment: Record<string, string>;
  social: Record<string, string>;
}
