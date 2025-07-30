export interface Book {
  id: number;
  title: string;
  author: string;
  detail: string;
  abstract: string;
  type: string;
  publishedAt: number;
  genreId: number | null;
  genre?: {
    id: number;
    name: string;
  };
}

// Coffee shop interfaces
export interface Category {
  id: number;
  name: string;
  name_th: string;
  description: string | null;
}

export interface MenuItem {
  id: number;
  name: string;
  name_th: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: number;
  category: Category;
  is_popular: boolean;
  is_hot: boolean;
  is_available: boolean;
}

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
  special_instructions?: string;
}

export interface OrderCreateRequest {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: number;
  notes?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  items: OrderItem[];
}

export interface Order {
  id: number;
  customer_id: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  table_number: number | null;
  total_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  notes: string | null;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    order_id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions: string | null;
    menu_item: MenuItem;
  }>;
}