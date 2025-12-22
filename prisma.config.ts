import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load variables from .env.local for Prisma CLI
config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
})
