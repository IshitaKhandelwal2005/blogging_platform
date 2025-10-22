import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import slugify from 'slugify';
import { pgPool } from '../../db/client';
import { Category } from '../../types/schema';
import { TRPCError } from '@trpc/server';

const categoryInput = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional()
});

export const categoriesRouter = router({
  create: publicProcedure.input(categoryInput).mutation(async ({ input }) => {
    try {
      const slug = slugify(input.name, { lower: true });
      const res = await pgPool.query(
        `insert into categories(name, slug, description) values($1, $2, $3) returning *`,
        [input.name, slug, input.description || null]
      );
      return res.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A category with this name already exists'
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create category'
      });
    }
  }),

  list: publicProcedure.query(async () => {
    try {
      const rows = await pgPool.query(`select * from categories order by name asc`);
      return rows.rows;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories'
      });
    }
  }),

  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    try {
      const res = await pgPool.query(`select * from categories where id = $1 limit 1`, [input.id]);
      if (!res.rows[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found'
        });
      }
      return res.rows[0];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch category'
      });
    }
  }),

  update: publicProcedure
    .input(z.object({ id: z.number(), data: categoryInput }))
    .mutation(async ({ input }) => {
      try {
        const slug = slugify(input.data.name, { lower: true });
        const res = await pgPool.query(
          `update categories set name = $1, slug = $2, description = $3 where id = $4 returning *`,
          [input.data.name, slug, input.data.description || null, input.id]
        );
        if (!res.rows[0]) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found'
          });
        }
        return res.rows[0];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A category with this name already exists'
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category'
        });
      }
    }),

  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    try {
      // Check if category is in use
      const usageCheck = await pgPool.query(
        `select count(*) as count from post_categories where category_id = $1`,
        [input.id]
      );
      const count = parseInt(usageCheck.rows[0]?.count || '0');
      
      if (count > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete category. It is assigned to ${count} post(s).`
        });
      }

      const res = await pgPool.query(`delete from categories where id = $1 returning *`, [input.id]);
      if (!res.rows[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found'
        });
      }
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete category'
      });
    }
  })
});
