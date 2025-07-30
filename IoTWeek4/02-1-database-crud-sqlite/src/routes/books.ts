import { Hono } from "hono";
import drizzle from "../db/drizzle.js";
import { books } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";

const booksRouter = new Hono();

booksRouter.get("/", async (c) => {
  const allBooks = await drizzle.select().from(books);
  return c.json(allBooks);
});

booksRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const result = await drizzle.query.books.findFirst({
    where: eq(books.id, id),
    with: {
      genre: true,
    },
  });
  if (!result) {
    return c.json({ error: "Book not found" }, 404);
  }
  return c.json(result);
});

booksRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      title: z.string().min(1),
      author: z.string().min(1),
      detail: z.string().min(1),
      abstract: z.string().min(1),
      type: z.string().min(1),
      publishedAt: z.iso.datetime({ offset: true }).transform((data) => dayjs(data).unix()),
      genreId: z.number().int().optional().nullable(),
    })
  ),
  async (c) => {
    const { title, author, publishedAt, genreId, detail, abstract, type } = c.req.valid("json");
    const result = await drizzle
      .insert(books)
      .values({
        title,
        author,
        detail,
        abstract,
        type,
        publishedAt,
        genreId: genreId ?? null,
      })
      .returning();
    return c.json({ success: true, book: result[0] }, 201);
  }
);

booksRouter.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      title: z.string().min(1).optional(),
      author: z.string().min(1).optional(),
      detail: z.string().min(1).optional(),
      abstract: z.string().min(1).optional(),
      type: z.string().min(1).optional(),
      publishedAt: z
        .union([z.string().datetime(), z.date()])
        .optional()
        .transform((data) => {
          if (!data) return undefined;
          return dayjs(data).unix();
        }),
      genreId: z.number().int().optional().nullable(),
    })
  ),
  async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );
    
    const updated = await drizzle
      .update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();
      
    if (updated.length === 0) {
      return c.json({ error: "Book not found" }, 404);
    }
    return c.json({ success: true, book: updated[0] });
  }
);

booksRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const deleted = await drizzle.delete(books).where(eq(books.id, id)).returning();
  if (deleted.length === 0) {
    return c.json({ error: "Book not found" }, 404);
  }
  return c.json({ success: true, book: deleted[0] });
});

export default booksRouter;
