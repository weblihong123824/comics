import type { Config } from 'drizzle-kit';

export default {
  schema: './app/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite', // For local development
  dbCredentials: {
    url: 'file:./sqlite.db',
  },
} satisfies Config;