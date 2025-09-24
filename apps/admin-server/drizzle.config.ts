import type { Config } from 'drizzle-kit';

export default {
  schema: './app/db/schema.ts',
  out: './app/db/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.db',
  },
} satisfies Config;