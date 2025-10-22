import { pgTable, serial, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  slug: varchar('slug', { length: 255 }).notNull(), // add unique index in migration
  // published flag indicates whether the post is public or a draft
  published: boolean('published').default(false),
  // keep created_at timestamp
  created_at: timestamp('created_at').defaultNow()
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(), // add unique index in migration
  description: text('description')
});

export const postCategories = pgTable('post_categories', {
  post_id: serial('post_id').notNull(),
  category_id: serial('category_id').notNull()
});
