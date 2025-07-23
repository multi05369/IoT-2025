import { Hono } from 'hono';
import studentRouter from './student.js';
import { bearerAuth } from 'hono/bearer-auth';
const apiRouter = new Hono();
apiRouter.get('/', (c) => {
    return c.json({
        message: "Welcome to the IoT API!"
    });
});
apiRouter.use("*", bearerAuth({
    verifyToken: async (token, c) => {
        const apiSecret = process.env.API_SECRET;
        return token === apiSecret;
    },
}));
apiRouter.get('/health', (c) => {
    return c.json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});
apiRouter.route('/student', studentRouter);
export default apiRouter;
