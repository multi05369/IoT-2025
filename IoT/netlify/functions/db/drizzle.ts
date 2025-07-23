import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

let db: ReturnType<typeof drizzle> | null = null

export default function getDatabase() {
  if (!db) {
    const databaseUrl = process.env.POSTGRES_URL
    
    if (!databaseUrl) {
      throw new Error('POSTGRES_URL environment variable is not set')
    }
    
    const sql = neon(databaseUrl)
    db = drizzle(sql, { schema })
  }
  
  return db
}