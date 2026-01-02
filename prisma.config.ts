import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load variables from .env.local for Prisma CLI
config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Use DIRECT_URL for migrations (Session Mode - Port 5432)
    url: env('DIRECT_URL'),
  },
})
