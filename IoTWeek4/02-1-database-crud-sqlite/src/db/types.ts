export type BookType = "education" | "fiction" | "non-fiction";

// Coffee shop types
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// Order creation request type
export interface OrderCreateRequest {
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  table_number?: string | null;
  notes?: string | null;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  items: OrderItemRequest[];
}

// Order item request type
export interface OrderItemRequest {
  menu_item_id: number;
  quantity: number;
  special_instructions?: string | null;
}

// Order status update type
export interface OrderStatusUpdate {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  changed_by?: string;
  notes?: string | null;
}

// Menu item type
export interface MenuItem {
  id: number;
  name: string;
  name_th?: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: number;
  is_popular: number;
  is_hot: number;
  is_available: number;
  category?: {
    id: number;
    name: string;
    name_th?: string;
    description?: string;
  };
}

// Order item with menu details
export interface OrderItemWithMenu {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  created_at: string;
  menu_item: {
    id: number;
    name: string;
    name_th?: string;
    description?: string;
    price: number;
    image_url?: string;
    category: {
      id: number;
      name: string;
      name_th?: string;
    };
  };
}

// Complete order with items
export interface OrderWithItems {
  id: number;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  table_number?: string;
  total_amount: number;
  status: string;
  notes?: string;
  order_type: string;
  created_at: string;
  updated_at: string;
  items: OrderItemWithMenu[];
}

// Dashboard statistics
export interface DashboardStats {
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  today_revenue: number;
  today_orders: number;
}

// Order status history
export interface OrderStatusHistoryEntry {
  id: number;
  order_id: number;
  status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}