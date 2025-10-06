import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/wecover'
    });
  }

  if (!db) {
    db = drizzle(pool, { schema });
  }

  return db;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

