import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDatabase(env: { DB: any }) {
  return drizzle(env.DB, { schema });
}

export type Database = ReturnType<typeof createDatabase>;

// 导出schema
export * from './schema';
