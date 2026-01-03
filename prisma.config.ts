import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load variables from .env.local for Prisma CLI (only in development)
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Runtime: Uses DATABASE_URL (port 6543 - pgBouncer pooler)
    // Migrations: Uses DIRECT_URL (port 5432 - direct connection)
    url: env('DIRECT_URL') || env('DATABASE_URL'),
  },
})
