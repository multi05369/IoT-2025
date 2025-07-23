import { Hono } from 'hono'
import drizzle from '../db/drizzle'
import { student } from '../db/schema'
import { eq } from 'drizzle-orm'

const studentRouter = new Hono()

studentRouter.get('/', async (c) => {
  try {
    const students = await drizzle.select().from(student)
    return c.json(students)
  } catch (error) {
    return c.json({ error: 'Failed to fetch students' }, 500)
  }
})

studentRouter.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID format' }, 400)
    }
    
    const result = await drizzle.query.student.findFirst({
      where: eq(student.id, id)
    })
    
    if (!result) {
      return c.json({ message: 'Student not found' }, 404)
    }
    
    return c.json(result)
  } catch (error) {
    return c.json({ error: 'Failed to fetch student' }, 500)
  }
})

studentRouter.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const newStudent = {
      name: body.name,
      surname: body.surname,
      dob: body.dob,
      gender: body.gender,
      grade: body.grade
    }
    
    const result = await drizzle.insert(student).values(newStudent).returning()
    return c.json(result[0], 201)
  } catch (error) {
    return c.json({ error: 'Failed to create student' }, 500)
  }
})

studentRouter.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID format' }, 400)
    }
    
    const body = await c.req.json()
    const updatedStudent = {
      name: body.name,
      surname: body.surname,
      dob: body.dob,
      gender: body.gender,
      grade: body.grade
    }
    
    const result = await drizzle
      .update(student)
      .set(updatedStudent)
      .where(eq(student.id, id))
      .returning()
    
    if (result.length === 0) {
      return c.json({ message: 'Student not found' }, 404)
    }
    
    return c.json(result[0])
  } catch (error) {
    return c.json({ error: 'Failed to update student' }, 500)
  }
})

studentRouter.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (isNaN(id)) {
      return c.json({ message: 'Invalid ID format' }, 400)
    }
    
    const result = await drizzle
      .delete(student)
      .where(eq(student.id, id))
      .returning()
    
    if (result.length === 0) {
      return c.json({ message: 'Student not found' }, 404)
    }
    
    return c.json({ message: 'Student deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete student' }, 500)
  }
})

export default studentRouter