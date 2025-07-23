// netlify/functions/api.ts
import { Handler } from '@netlify/functions'
import { Hono } from 'hono'
import { handle } from 'hono/netlify'

// Import your existing routes
import studentRouter from '../edge-functions/routes/student'

const app = new Hono()

// Basic routes
app.get('/', (c) => {
  return c.json({
    message: "Welcome to the IoT API!"
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