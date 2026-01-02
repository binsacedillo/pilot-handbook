import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load variables from .env.local for Prisma CLI (only in development)
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Use DATABASE_URL for production, fallback to DIRECT_URL for development
    url: env('DATABASE_URL') || env('DIRECT_URL'),
  },
})
