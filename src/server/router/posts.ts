import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import slugify from 'slugify';
import { db, pgPool } from '../../db/client';
import { Post, PostWithCategories } from '../../types/schema';
// we will use pgPool for raw SQL queries in this router

const postInput = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  published: z.boolean().optional(),
  categoryIds: z.array(z.number()).min(1)
});

export const postsRouter = router({
  create: publicProcedure.input(postInput).mutation(async ({ input }) => {
    const slug = slugify(input.title, { lower: true });
    const insertRes = await pgPool.query(
      `insert into posts(title, content, slug, image_url, published) values($1, $2, $3, $4, $5) returning *`,
      [input.title, input.content, slug, input.imageUrl || null, !!input.published]
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
    .input(z.object({ 
      categoryId: z.number().optional(), 
      includeDrafts: z.boolean().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10)
    }).optional())
    .query(async ({ input = {} }) => {
      // includeDrafts === true  => show only drafts (published = false)
      // includeDrafts === false => show only published (published = true)
      const showDraftsOnly = !!input.includeDrafts;
      const page = input.page || 1;
      const limit = input.limit || 10;
      const offset = (page - 1) * limit;

      if (input?.categoryId) {
        // join posts -> post_categories -> categories
        const publishedFilter = showDraftsOnly ? 'and p.published = false' : 'and p.published = true';
        const countQuery = `
          select count(distinct p.id) as total 
          from posts p 
          inner join post_categories pc on pc.post_id = p.id 
          where pc.category_id = $1 ${publishedFilter}
        `;
        
        const countResult = await pgPool.query(countQuery, [input.categoryId]);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        const rows = await pgPool.query(
          `select p.*, 
                  json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) as categories 
           from posts p 
           inner join post_categories pc on pc.post_id = p.id 
           inner join categories c on c.id = pc.category_id 
           where pc.category_id = $1 ${publishedFilter} 
           group by p.id 
           order by p.created_at desc
           limit $2 offset $3`,
           [input.categoryId, limit, offset]
        );
        
        return {
          posts: rows.rows.map(row => ({
            ...row,
            imageUrl: row.image_url,
            categories: row.categories || []
          })),
          pagination: {
            total,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        };
      }

      const whereClause = showDraftsOnly ? 'where p.published = false' : 'where p.published = true';
      
      // Get total count
      const countQuery = `
        select count(*) as total 
        from posts p
        ${whereClause}
      `;
      
      const countResult = await pgPool.query(countQuery);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      
      // Get paginated posts
      const postsRes = await pgPool.query(`
        with post_cats as ( 
          select pc.post_id, json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) as categories
          from post_categories pc
          inner join categories c on c.id = pc.category_id
          group by pc.post_id
        )
        select p.*, coalesce(pc.categories, '[]'::json) as categories
        from posts p
        left join post_cats pc on pc.post_id = p.id
        ${whereClause}
        order by p.created_at desc
        limit $1 offset $2
      `, [limit, offset]);
      
      return {
        posts: postsRes.rows.map(row => ({
          ...row,
          imageUrl: row.image_url,
          categories: row.categories || []
        })),
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    }),

  get: publicProcedure.input(z.object({ slug: z.string(), includeDrafts: z.boolean().optional() }).optional()).query(async ({ input }) => {
    const includeDrafts = !!input?.includeDrafts;
    const postRes = await pgPool.query(
      `with post_cats as (
        select pc.post_id, json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) as categories
        from post_categories pc
        inner join categories c on c.id = pc.category_id
        where pc.post_id = (select id from posts where slug = $1 ${includeDrafts ? '' : 'and published = true'} limit 1)
        group by pc.post_id
      )
      select p.*, coalesce(pc.categories, '[]'::json) as categories
      from posts p
      left join post_cats pc on pc.post_id = p.id
      where p.slug = $1 ${includeDrafts ? '' : 'and p.published = true'}
      limit 1`,
      [input?.slug]
    );
    if (!postRes.rows[0]) return null;
    return {
      ...postRes.rows[0],
      imageUrl: postRes.rows[0].image_url,
      categories: postRes.rows[0].categories || []
    };
  }),

  update: publicProcedure.input(z.object({ id: z.number(), data: postInput })).mutation(async ({ input }) => {
    await pgPool.query(`update posts set title=$1, content=$2, image_url=$3, published=$4 where id=$5`, [input.data.title, input.data.content, input.data.imageUrl || null, !!input.data.published, input.id]);
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
