import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { 
  getAllMenuItems, 
  getMenuItemById, 
  getPopularMenuItems 
} from '../db/coffee-queries.js';

const menuRouter = new Hono();

// Get popular menu items (must be before /:id route)
menuRouter.get('/popular', async (c) => {
  try {
    const popularItems = await getPopularMenuItems();
    return c.json(popularItems);
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to fetch popular items' });
  }
});

// Get all menu items
menuRouter.get('/', async (c) => {
  try {
    const categoryId = c.req.query('category_id');
    const availableOnly = c.req.query('available_only') !== 'false';

    const menuItems = await getAllMenuItems(
      categoryId ? parseInt(categoryId) : undefined,
      availableOnly
    );

    return c.json(menuItems);
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to fetch menu items' });
  }
});

// Get menu item by ID
menuRouter.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const menuItem = await getMenuItemById(id);

    if (!menuItem) {
      throw new HTTPException(404, { message: 'Menu item not found' });
    }

    return c.json(menuItem);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    throw new HTTPException(500, { message: 'Failed to fetch menu item' });
  }
});

export default menuRouter;