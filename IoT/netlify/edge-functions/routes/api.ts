import { Hono } from 'hono'
import studentRouter from './student'
import { env } from 'hono/adapter'
import { bearerAuth } from 'hono/bearer-auth'

const apiRouter = new Hono()

apiRouter.get('/', (c) => {
  return c.json({
    message: "Welcome to the IoT API!"
  })
})

apiRouter.use(
  "*",
  bearerAuth({
    verifyToken: async (token, c) => {
      const { API_SECRET } = env<{ API_SECRET: string }>(c)
      return token === API_SECRET
    },
  })
)

apiRouter.get('/health', (c) => {
  return c.json({
    status: "OK",
    timestamp: new Date().toISOString()
  })
})

apiRouter.route('/student', studentRouter)

export default apiRouter