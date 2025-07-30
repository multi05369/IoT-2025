import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { 
  createOrder, 
  getOrderWithItems, 
  getOrders,
  updateOrderStatus,
  getOrdersByStatus,
  getOrderStatusHistory,
  getDashboardStats
} from '../db/coffee-queries.js';
import type { OrderCreateRequest, OrderStatusUpdate } from '../db/types.js';

const ordersRouter = new Hono();

// Get all orders (for admin/dashboard)
ordersRouter.get('/', async (c) => {
  try {
    const status = c.req.query('status');
    const orderType = c.req.query('order_type');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0;
    
    const orders = await getOrders(status || undefined, orderType || undefined, limit, offset);
    return c.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    throw new HTTPException(500, { message: 'Failed to fetch orders' });
  }
});

// Get orders by status (specific endpoint)
ordersRouter.get('/status/:status', async (c) => {
  try {
    const status = c.req.param('status');
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new HTTPException(400, { message: 'Invalid status' });
    }
    
    const orders = await getOrdersByStatus(status);
    return c.json(orders);
  } catch (error) {
    console.error('Get orders by status error:', error);
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch orders by status' });
  }
});

// Create a new order
ordersRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      throw new HTTPException(400, { message: 'Order must contain at least one item' });
    }

    if (!body.customer_name || body.customer_name.trim() === '') {
      throw new HTTPException(400, { message: 'Customer name is required' });
    }

    // Validate each item
    for (const item of body.items) {
      if (!item.menu_item_id || !item.quantity) {
        throw new HTTPException(400, { message: 'Each item must have menu_item_id and quantity' });
      }
      if (item.quantity <= 0) {
        throw new HTTPException(400, { message: 'Quantity must be greater than 0' });
      }
    }

    // Prepare order data for Drizzle format
    const orderData: OrderCreateRequest = {
      customer_name: body.customer_name.trim(),
      customer_email: body.customer_email?.trim() || null,
      customer_phone: body.customer_phone?.trim() || null,
      table_number: body.table_number || null,
      notes: body.notes?.trim() || null,
      order_type: body.order_type || 'takeaway', // Default to takeaway
      items: body.items.map((item: any) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        special_instructions: item.special_instructions || null
      }))
    };

    const orderId = await createOrder(orderData);
    
    return c.json({ 
      success: true, 
      order_id: orderId,
      message: 'Order placed successfully' 
    }, 201);
    
  } catch (error: any) {
    console.error('Order creation error:', error);
    if (error instanceof HTTPException) throw error;
    
    // Handle specific validation errors from the database
    if (error.message?.includes('not found or unavailable')) {
      throw new HTTPException(400, { message: error.message });
    }
    
    throw new HTTPException(500, { message: 'Failed to create order' });
  }
});

// Get order by ID with items
ordersRouter.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid order ID' });
    }
    
    const order = await getOrderWithItems(id);
    
    if (!order) {
      throw new HTTPException(404, { message: 'Order not found' });
    }
    
    return c.json(order);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch order' });
  }
});

// Update order status
ordersRouter.patch('/:id/status', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid order ID' });
    }
    
    if (!body.status) {
      throw new HTTPException(400, { message: 'Status is required' });
    }
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      throw new HTTPException(400, { message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    const statusUpdate: OrderStatusUpdate = {
      status: body.status,
      changed_by: body.changed_by || 'Employee',
      notes: body.notes || null
    };
    
    await updateOrderStatus(id, statusUpdate);
    
    return c.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
    
  } catch (error: any) {
    console.error('Update order status error:', error);
    if (error instanceof HTTPException) throw error;
    
    if (error.message === 'Order not found') {
      throw new HTTPException(404, { message: 'Order not found' });
    }
    
    throw new HTTPException(500, { message: 'Failed to update order status' });
  }
});

// Get order status history
ordersRouter.get('/:id/history', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid order ID' });
    }
    
    const history = await getOrderStatusHistory(id);
    return c.json(history);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch order history' });
  }
});

// Get dashboard statistics
ordersRouter.get('/stats/dashboard', async (c) => {
  try {
    const stats = await getDashboardStats();
    return c.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw new HTTPException(500, { message: 'Failed to fetch dashboard statistics' });
  }
});

export default ordersRouter;