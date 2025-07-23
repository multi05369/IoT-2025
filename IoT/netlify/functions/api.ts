import { Handler } from '@netlify/functions'
import { Hono } from 'hono'
import { handle } from 'hono/netlify'
import { cors } from 'hono/cors'

// Import your routes (now from the correct path)
import studentRouter from './routes/student'

const app = new Hono()

// Add CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Basic routes
app.get('/', (c) => {
  return c.json({
    message: "Welcome to the IoT API!",
    timestamp: new Date().toISOString()
  })
})

app.get('/health', (c) => {
  return c.json({
    status: "OK",
    timestamp: new Date().toISOString()
  })
})

// Mount student routes
app.route('/student', studentRouter)

// Export as Netlify function handler
export const handler: Handler = handle(app)