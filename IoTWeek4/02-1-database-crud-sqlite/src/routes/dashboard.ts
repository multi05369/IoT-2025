import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getDashboardStats } from '../db/coffee-queries.js';

const dashboardRouter = new Hono();

dashboardRouter.get('/stats', async (c) => {
  try {
    const stats = await getDashboardStats();
    return c.json(stats);
  } catch (error) {
    throw new HTTPException(500, { message: 'Failed to fetch dashboard stats' });
  }
});

export default dashboardRouter;