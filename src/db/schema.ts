import { pgTable, serial, text, varchar, timestamp, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  image_url: text('image_url'),
  published: boolean('published').default(false),
  created_at: timestamp('created_at').defaultNow()
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description')
});

export const postCategories = pgTable('post_categories', {
  post_id: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' })
}, (table) => ({
  pk: primaryKey({ columns: [table.post_id, table.category_id] })
}));
