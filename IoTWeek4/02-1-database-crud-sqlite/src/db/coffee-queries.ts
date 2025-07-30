import { eq, and, desc, asc, sql } from "drizzle-orm";
import drizzle from "./drizzle.js";
import { 
  categories, 
  menuItems, 
  orders, 
  orderItems, 
  customers, 
  orderStatusHistory 
} from "./schema.js";
import type { OrderCreateRequest, OrderStatusUpdate } from "./types.js";

// Category queries
export const getAllCategories = async () => {
  return await drizzle.select().from(categories).orderBy(categories.id);
};

// Menu queries
export const getAllMenuItems = async (categoryId?: number, availableOnly = true) => {
  const conditions = [];
  
  if (categoryId) {
    conditions.push(eq(menuItems.category_id, categoryId));
  }
  
  if (availableOnly) {
    conditions.push(eq(menuItems.is_available, 1));
  }

  return await drizzle
    .select({
      id: menuItems.id,
      name: menuItems.name,
      name_th: menuItems.name_th,
      description: menuItems.description,
      price: menuItems.price,
      image_url: menuItems.image_url,
      category_id: menuItems.category_id,
      is_popular: menuItems.is_popular,
      is_hot: menuItems.is_hot,
      is_available: menuItems.is_available,
      category: {
        id: categories.id,
        name: categories.name,
        name_th: categories.name_th,
        description: categories.description,
      }
    })
    .from(menuItems)
    .innerJoin(categories, eq(menuItems.category_id, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(categories.id, menuItems.name);
};

export const getMenuItemById = async (id: number) => {
  const result = await drizzle
    .select({
      id: menuItems.id,
      name: menuItems.name,
      name_th: menuItems.name_th,
      description: menuItems.description,
      price: menuItems.price,
      image_url: menuItems.image_url,
      category_id: menuItems.category_id,
      is_popular: menuItems.is_popular,
      is_hot: menuItems.is_hot,
      is_available: menuItems.is_available,
      category: {
        id: categories.id,
        name: categories.name,
        name_th: categories.name_th,
        description: categories.description,
      }
    })
    .from(menuItems)
    .innerJoin(categories, eq(menuItems.category_id, categories.id))
    .where(eq(menuItems.id, id))
    .limit(1);

  return result[0] || null;
};

export const getPopularMenuItems = async () => {
  return await drizzle
    .select({
      id: menuItems.id,
      name: menuItems.name,
      name_th: menuItems.name_th,
      description: menuItems.description,
      price: menuItems.price,
      image_url: menuItems.image_url,
      category_id: menuItems.category_id,
      is_popular: menuItems.is_popular,
      is_hot: menuItems.is_hot,
      is_available: menuItems.is_available,
      category: {
        id: categories.id,
        name: categories.name,
        name_th: categories.name_th,
        description: categories.description,
      }
    })
    .from(menuItems)
    .innerJoin(categories, eq(menuItems.category_id, categories.id))
    .where(and(eq(menuItems.is_popular, 1), eq(menuItems.is_available, 1)))
    .orderBy(menuItems.name);
};

// Order queries
export const createOrder = async (orderData: OrderCreateRequest) => {
  return await drizzle.transaction(async (tx) => {
    let customerId = null;

    // Create customer if email provided
    if (orderData.customer_email) {
      const existingCustomer = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.email, orderData.customer_email))
        .limit(1);
      
      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
      } else {
        const newCustomer = await tx
          .insert(customers)
          .values({
            name: orderData.customer_name || null,
            phone: orderData.customer_phone || null,
            email: orderData.customer_email,
          })
          .returning({ id: customers.id });
        customerId = newCustomer[0].id;
      }
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of orderData.items) {
      const menuItem = await tx
        .select({ id: menuItems.id, price: menuItems.price })
        .from(menuItems)
        .where(and(eq(menuItems.id, item.menu_item_id), eq(menuItems.is_available, 1)))
        .limit(1);

      if (menuItem.length === 0) {
        throw new Error(`Menu item ${item.menu_item_id} not found or unavailable`);
      }

      const itemTotal = menuItem[0].price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem[0].price,
        total_price: itemTotal,
        special_instructions: item.special_instructions || null,
      });
    }

    // Create order
    const newOrder = await tx
      .insert(orders)
      .values({
        customer_id: customerId,
        customer_name: orderData.customer_name || null,
        customer_phone: orderData.customer_phone || null,
        table_number: orderData.table_number || null,
        total_amount: totalAmount,
        status: 'pending',
        notes: orderData.notes || null,
        order_type: orderData.order_type,
      })
      .returning({ id: orders.id });

    const orderId = newOrder[0].id;

    // Create order items
    for (const itemData of orderItemsData) {
      await tx.insert(orderItems).values({
        order_id: orderId,
        ...itemData,
      });
    }

    // Create status history
    await tx.insert(orderStatusHistory).values({
      order_id: orderId,
      status: 'pending',
      changed_by: 'System',
      notes: 'Order created',
    });

    return orderId;
  });
};

export const getOrderWithItems = async (orderId: number) => {
  const order = await drizzle
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (order.length === 0) return null;

  const items = await drizzle
    .select({
      id: orderItems.id,
      order_id: orderItems.order_id,
      menu_item_id: orderItems.menu_item_id,
      quantity: orderItems.quantity,
      unit_price: orderItems.unit_price,
      total_price: orderItems.total_price,
      special_instructions: orderItems.special_instructions,
      created_at: orderItems.created_at,
      menu_item: {
        id: menuItems.id,
        name: menuItems.name,
        name_th: menuItems.name_th,
        description: menuItems.description,
        price: menuItems.price,
        image_url: menuItems.image_url,
        category: {
          id: categories.id,
          name: categories.name,
          name_th: categories.name_th,
        }
      }
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menu_item_id, menuItems.id))
    .innerJoin(categories, eq(menuItems.category_id, categories.id))
    .where(eq(orderItems.order_id, orderId));

  return { ...order[0], items };
};

export const getOrders = async (status?: string, orderType?: string, limit = 50, offset = 0) => {
  const conditions = [];
  
  if (status) {
    conditions.push(eq(orders.status, status));
  }
  
  if (orderType) {
    conditions.push(eq(orders.order_type, orderType));
  }

  const ordersList = await drizzle
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.created_at))
    .limit(limit)
    .offset(offset);

  // Get items for each order
  const ordersWithItems = await Promise.all(
    ordersList.map(async (order) => {
      const items = await drizzle
        .select({
          id: orderItems.id,
          order_id: orderItems.order_id,
          menu_item_id: orderItems.menu_item_id,
          quantity: orderItems.quantity,
          unit_price: orderItems.unit_price,
          total_price: orderItems.total_price,
          special_instructions: orderItems.special_instructions,
          created_at: orderItems.created_at,
          menu_item: {
            id: menuItems.id,
            name: menuItems.name,
            name_th: menuItems.name_th,
            description: menuItems.description,
            price: menuItems.price,
            image_url: menuItems.image_url,
            category: {
              id: categories.id,
              name: categories.name,
              name_th: categories.name_th,
            }
          }
        })
        .from(orderItems)
        .innerJoin(menuItems, eq(orderItems.menu_item_id, menuItems.id))
        .innerJoin(categories, eq(menuItems.category_id, categories.id))
        .where(eq(orderItems.order_id, order.id));

      return { ...order, items };
    })
  );

  return ordersWithItems;
};

export const updateOrderStatus = async (orderId: number, statusUpdate: OrderStatusUpdate) => {
  return await drizzle.transaction(async (tx) => {
    // Check if order exists
    const order = await tx
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      throw new Error('Order not found');
    }

    // Update order status
    await tx
      .update(orders)
      .set({ status: statusUpdate.status })
      .where(eq(orders.id, orderId));

    // Create status history entry
    await tx.insert(orderStatusHistory).values({
      order_id: orderId,
      status: statusUpdate.status,
      changed_by: statusUpdate.changed_by || 'Employee',
      notes: statusUpdate.notes || null,
    });

    return orderId;
  });
};

export const getOrdersByStatus = async (status: string) => {
  const ordersList = await drizzle
    .select()
    .from(orders)
    .where(eq(orders.status, status))
    .orderBy(asc(orders.created_at));

  const ordersWithItems = await Promise.all(
    ordersList.map(async (order) => {
      const items = await drizzle
        .select({
          id: orderItems.id,
          order_id: orderItems.order_id,
          menu_item_id: orderItems.menu_item_id,
          quantity: orderItems.quantity,
          unit_price: orderItems.unit_price,
          total_price: orderItems.total_price,
          special_instructions: orderItems.special_instructions,
          created_at: orderItems.created_at,
          menu_item: {
            id: menuItems.id,
            name: menuItems.name,
            name_th: menuItems.name_th,
            description: menuItems.description,
            price: menuItems.price,
            image_url: menuItems.image_url,
            category: {
              id: categories.id,
              name: categories.name,
              name_th: categories.name_th,
            }
          }
        })
        .from(orderItems)
        .innerJoin(menuItems, eq(orderItems.menu_item_id, menuItems.id))
        .innerJoin(categories, eq(menuItems.category_id, categories.id))
        .where(eq(orderItems.order_id, order.id));

      return { ...order, items };
    })
  );

  return ordersWithItems;
};

export const getOrderStatusHistory = async (orderId: number) => {
  const history = await drizzle
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.order_id, orderId))
    .orderBy(asc(orderStatusHistory.created_at));

  return history;
};

// Dashboard queries
export const getDashboardStats = async () => {
  const [pendingCount] = await drizzle
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, 'pending'));

  const [preparingCount] = await drizzle
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, 'preparing'));

  const [readyCount] = await drizzle
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, 'ready'));

  const [todayRevenue] = await drizzle
    .select({ revenue: sql<number>`COALESCE(SUM(total_amount), 0)` })
    .from(orders)
    .where(
      and(
        sql`DATE(created_at) = DATE('now')`,
        sql`status IN ('completed', 'ready')`
      )
    );

  const [todayOrders] = await drizzle
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(sql`DATE(created_at) = DATE('now')`);

  return {
    pending_orders: pendingCount.count,
    preparing_orders: preparingCount.count,
    ready_orders: readyCount.count,
    today_revenue: todayRevenue.revenue,
    today_orders: todayOrders.count,
  };
};