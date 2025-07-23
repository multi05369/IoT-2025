import { Hono } from 'hono'
import { cors } from 'hono/cors'
import apiRouter from './routes/api.ts'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

app.route('/', apiRouter)

export const config = {
  runtime: 'edge',
}

export default app.fetch