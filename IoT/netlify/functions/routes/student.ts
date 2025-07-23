import { Hono } from 'hono'
import getDatabase from '../db/drizzle.js'
import { student } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const studentRouter = new Hono()

studentRouter.get('/', async (c) => {
  const db = getDatabase()
  const students = await db.select().from(student)
  return c.json(students)
})

studentRouter.get('/:id', async (c) => {
  const db = getDatabase()
  const id = Number(c.req.param("id"))
  const result = await db.select().from(student).where(eq(student.id, id))
  
  if (!result || result.length === 0) {
    return c.json({
      message: "Student not found"
    }, 404)
  }
  
  return c.json(result[0])
})

studentRouter.post('/', async (c) => {
  const db = getDatabase()
  const body = await c.req.json()
  const newStudent = {
    name: body.name,
    surname: body.surname,
    dob: body.dob,
    gender: body.gender,
    grade: body.grade
  }
  
  const result = await db.insert(student).values(newStudent).returning()
  return c.json(result)
})

studentRouter.put('/:id', async (c) => {
  const db = getDatabase()
  const id = Number(c.req.param("id"))
  const body = await c.req.json()
  const updatedStudent = {
    name: body.name,
    surname: body.surname,
    dob: body.dob,
    gender: body.gender,
    grade: body.grade
  }
  
  const result = await db.update(student).set(updatedStudent).where(eq(student.id, id)).returning()
  return c.json(result)
})

studentRouter.delete('/:id', async (c) => {
  const db = getDatabase()
  const id = Number(c.req.param("id"))
  const result = await db.delete(student).where(eq(student.id, id)).returning()
  return c.json(result)
})

export default studentRouter