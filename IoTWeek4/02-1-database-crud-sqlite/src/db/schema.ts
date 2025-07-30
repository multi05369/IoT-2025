import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";
import type { BookType } from "./types.js";

// Existing tables
export const genres = t.sqliteTable("genres", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  title: t.text().notNull(),
});

export const books = t.sqliteTable("books", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  title: t.text().notNull(),
  author: t.text().notNull(),
  detail: t.text().notNull(),
  abstract: t.text().notNull(),
  type: t.text().$type<BookType>().notNull().default("education"),
  publishedAt: t.integer().notNull(),
  genreId: t.integer().references(() => genres.id, {
    onDelete: "set null",
  }),
});

// Coffee shop tables
export const categories = t.sqliteTable("categories", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  name: t.text().notNull(),
  name_th: t.text().notNull(),
  description: t.text(),
  created_at: t.text().default("CURRENT_TIMESTAMP"),
  updated_at: t.text().default("CURRENT_TIMESTAMP"),
});

export const menuItems = t.sqliteTable("menu_items", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  name: t.text().notNull(),
  name_th: t.text().notNull(),
  description: t.text(),
  price: t.real().notNull(),
  image_url: t.text(),
  category_id: t.integer().references(() => categories.id, {
    onDelete: "cascade",
  }).notNull(),
  is_popular: t.integer().default(0),
  is_hot: t.integer().default(0),
  is_available: t.integer().default(1),
  created_at: t.text().default("CURRENT_TIMESTAMP"),
  updated_at: t.text().default("CURRENT_TIMESTAMP"),
});

export const customers = t.sqliteTable("customers", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  name: t.text(),
  phone: t.text(),
  email: t.text().unique(),
  created_at: t.text().default("CURRENT_TIMESTAMP"),
  updated_at: t.text().default("CURRENT_TIMESTAMP"),
});

export const orders = t.sqliteTable("orders", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  customer_id: t.integer().references(() => customers.id, {
    onDelete: "set null",
  }),
  customer_name: t.text(),
  customer_phone: t.text(),
  table_number: t.integer(),
  total_amount: t.real().notNull(),
  status: t.text().notNull().default("pending"),
  notes: t.text(),
  order_type: t.text().notNull(),
  created_at: t.text().default("CURRENT_TIMESTAMP"),
  updated_at: t.text().default("CURRENT_TIMESTAMP"),
});

export const orderItems = t.sqliteTable("order_items", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  order_id: t.integer().references(() => orders.id, {
    onDelete: "cascade",
  }).notNull(),
  menu_item_id: t.integer().references(() => menuItems.id, {
    onDelete: "cascade",
  }).notNull(),
  quantity: t.integer().notNull(),
  unit_price: t.real().notNull(),
  total_price: t.real().notNull(),
  special_instructions: t.text(),
  created_at: t.text().default("CURRENT_TIMESTAMP"),
});

export const orderStatusHistory = t.sqliteTable("order_status_history", {
  id: t.integer().primaryKey({ autoIncrement: true }),
  order_id: t.integer().references(() => orders.id, {
    onDelete: "cascade",
  }).notNull(),
  status: t.text().notNull(),
  changed_by: t.text(),
  notes: t.text(),
  created_at: t.text().default("CURRENT_TIMESTAMP"),
});

// Relations
export const bookRelations = relations(books, ({ one }) => ({
  genre: one(genres, {
    fields: [books.genreId],
    references: [genres.id],
  }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const menuItemRelations = relations(menuItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [menuItems.category_id],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const customerRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customer_id],
    references: [customers.id],
  }),
  orderItems: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menu_item_id],
    references: [menuItems.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.order_id],
    references: [orders.id],
  }),
}));