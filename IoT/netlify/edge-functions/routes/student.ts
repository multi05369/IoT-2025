import { Hono } from 'hono'
import drizzle from '../db/drizzle.ts'
import { student } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

const studentRouter = new Hono()

studentRouter.get('/', async (c) => {
    const students = await drizzle.select().from(student);
    return c.json(students);
});

studentRouter.get('/:id', async (c) => {
    const id = Number(c.req.param("id"));
    const result = await drizzle.query.student.findFirst({
        where: eq(student.id, id)
    });
    if (!result) {
        return c.json({
            message: "Student not found"
        }, 404);
    }
    return c.json(result);
});

studentRouter.post('/', async (c) => {
    const body = await c.req.json();
    const newStudent = {
        name: body.name,
        surname: body.surname,
        dob: body.dob,
        gender: body.gender,
        grade: body.grade
    };
    const result = await drizzle.insert(student).values(newStudent).returning();
    return c.json(result);
});

studentRouter.put('/:id', async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const updatedStudent = {
        name: body.name,
        surname: body.surname,
        dob: body.dob,
        gender: body.gender,
        grade: body.grade
    };
    const result = await drizzle.update(student).set(updatedStudent).where(eq(student.id, id)).returning();
    return c.json(result);
});

studentRouter.delete('/:id', async (c) => {
    const id = Number(c.req.param("id"));
    const result = await drizzle.delete(student).where(eq(student.id, id)).returning();
    return c.json(result);
});

export default studentRouter