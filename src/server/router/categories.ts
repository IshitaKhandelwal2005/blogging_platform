import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import slugify from 'slugify';
import { pgPool } from '../../db/client';
import { Category } from '../../types/schema';

const categoryInput = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const categoriesRouter = router({
  create: publicProcedure.input(categoryInput).mutation(async ({ input }) => {
    const slug = slugify(input.name, { lower: true });
    const res = await pgPool.query(`insert into categories(name, slug, description) values($1, $2, $3) returning *`, [input.name, slug, input.description]);
    return res.rows[0];
  }),

  list: publicProcedure.query(async () => {
    const rows = await pgPool.query(`select * from categories order by name asc`);
    return rows.rows;
  })
});
