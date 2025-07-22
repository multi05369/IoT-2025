// netlify/edge-functions/db/drizzle.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.ts'

const sql = neon(Deno.env.get('POSTGRES_URL')!)
const db = drizzle(sql, { schema })

export default db