import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getAllCategories } from '../db/coffee-queries.js';

const categoriesRouter = new Hono();

categoriesRouter.get('/', async (c) => {
  try {
    const categories = await getAllCategories();
    return c.json(categories);
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to fetch categories' });
  }
});

export default categoriesRouter;