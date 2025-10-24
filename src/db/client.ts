import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Only create pool if DATABASE_URL is available (runtime, not build time)
const connectionString = process.env.DATABASE_URL;

if (!connectionString && typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  console.warn('DATABASE_URL is not set. Database operations will fail.');
}

const pool = new Pool({
  connectionString: connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const pgPool = pool;
export const db = drizzle(pool);
