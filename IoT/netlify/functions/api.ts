import { Hono } from 'hono'
import { cors } from 'hono/cors'
import apiRouter from './routes/api.js'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.route('/v1', apiRouter)

// Custom handler for Netlify Functions
export const handler = async (event: any, context: any) => {
  try {
    // Construct the request URL
    const url = new URL(event.path || '/', `https://${event.headers.host || 'localhost'}`)
    
    // Add query parameters
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value))
      })
    }

    // Create headers object
    const headers = new Headers()
    if (event.headers) {
      Object.entries(event.headers).forEach(([key, value]) => {
        if (value) headers.set(key, String(value))
      })
    }

    // Create the request
    const request = new Request(url.toString(), {
      method: event.httpMethod || 'GET',
      headers,
      body: event.body || undefined,
    })

    // Process with Hono
    const response = await app.fetch(request)
    
    // Convert response for Netlify
    const responseBody = await response.text()
    const responseHeaders: Record<string, string> = {}
    
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseBody,
    }
  } catch (error) {
    console.error('Handler error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: (error instanceof Error ? error.message : String(error))
      }),
    }
  }
}