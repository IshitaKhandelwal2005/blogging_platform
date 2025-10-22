import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import slugify from 'slugify';
import { db, pgPool } from '../../db/client';
import { Post, PostWithCategories } from '../../types/schema';
import { TRPCError } from '@trpc/server';
// we will use pgPool for raw SQL queries in this router

const postInput = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().optional(),
  categoryIds: z.array(z.number()).optional()
});

export const postsRouter = router({
  create: publicProcedure.input(postInput).mutation(async ({ input }) => {
    const slug = slugify(input.title, { lower: true });
    const insertRes = await pgPool.query(
      `insert into posts(title, content, slug, published) values($1, $2, $3, $4) returning *`,
      [input.title, input.content, slug, !!input.published]
    );
    const created = insertRes.rows[0];

    if (input.categoryIds && input.categoryIds.length) {
      for (const cid of input.categoryIds) {
        await pgPool.query(`insert into post_categories(post_id, category_id) values($1, $2) on conflict do nothing`, [created.id, cid]);
      }
    }

    return created;
  }),

  list: publicProcedure
    .input(z.object({ categoryId: z.number().optional(), includeDrafts: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      // includeDrafts === true  => show only drafts (published = false)
      // includeDrafts === false => show only published (published = true)
      const showDraftsOnly = !!input?.includeDrafts;

      if (input?.categoryId) {
        // join posts -> post_categories -> categories
        const publishedFilter = showDraftsOnly ? 'and p.published = false' : 'and p.published = true';
        const rows = await pgPool.query(
          `select p.* from posts p inner join post_categories pc on pc.post_id = p.id where pc.category_id = $1 ${publishedFilter} order by p.created_at desc`,
          [input.categoryId]
        );
        return rows.rows;
      }

      const whereClause = showDraftsOnly ? 'where published = false' : 'where published = true';
      const rows = await pgPool.query(`select * from posts ${whereClause} order by created_at desc`);
      return rows.rows;
    }),

  get: publicProcedure.input(z.object({ slug: z.string(), includeDrafts: z.boolean().optional() }).optional()).query(async ({ input }) => {
    const includeDrafts = !!input?.includeDrafts;
    const postRes = await pgPool.query(`select * from posts where slug = $1 ${includeDrafts ? '' : 'and published = true'} limit 1`, [input?.slug]);
    if (!postRes.rows[0]) return null;
    const post = postRes.rows[0];
    const catRes = await pgPool.query(
      `select c.id, c.name, c.slug from categories c inner join post_categories pc on pc.category_id = c.id where pc.post_id = $1`,
      [post.id]
    );
    return { ...post, categories: catRes.rows };
  }),

  update: publicProcedure.input(z.object({ id: z.number(), data: postInput })).mutation(async ({ input }) => {
    await pgPool.query(`update posts set title=$1, content=$2, published=$3 where id=$4`, [input.data.title, input.data.content, !!input.data.published, input.id]);
    if (input.data.categoryIds) {
      await pgPool.query(`delete from post_categories where post_id = $1`, [input.id]);
      for (const cid of input.data.categoryIds) {
        await pgPool.query(`insert into post_categories(post_id, category_id) values($1, $2) on conflict do nothing`, [input.id, cid]);
      }
    }
    const upd = await pgPool.query(`select * from posts where id = $1 limit 1`, [input.id]);
    return upd.rows[0] || null;
  }),

  publish: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await pgPool.query(`update posts set published = true where id = $1`, [input.id]);
    const res = await pgPool.query(`select * from posts where id = $1 limit 1`, [input.id]);
    return res.rows[0] || null;
  }),

  unpublish: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await pgPool.query(`update posts set published = false where id = $1`, [input.id]);
    const res = await pgPool.query(`select * from posts where id = $1 limit 1`, [input.id]);
    return res.rows[0] || null;
  }),

  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await pgPool.query(`delete from post_categories where post_id = $1`, [input.id]);
    await pgPool.query(`delete from posts where id = $1`, [input.id]);
    return { success: true };
  })
});
