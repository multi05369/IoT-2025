import * as t from "drizzle-orm/pg-core";
export const student = t.pgTable("student", {
    id: t.serial("id").primaryKey(),
    name: t.text("name").notNull(),
    surname: t.text("surname").notNull(),
    dob: t.date("dob").notNull(),
    gender: t.text("gender").notNull(),
    grade: t.integer("grade").notNull()
});
