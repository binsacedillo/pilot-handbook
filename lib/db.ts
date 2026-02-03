import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  // Optimized pool configuration for serverless (Vercel) + Supabase pgBouncer
  // Since Supabase port 6543 already handles pooling, we keep client pool minimal
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Serverless-optimized settings
    max: 3,                      // Low limit: Vercel creates many Lambdas, each with own pool
    min: 0,                      // No idle connections in serverless
    idleTimeoutMillis: 30000,    // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Fail fast if unable to connect
    allowExitOnIdle: true,       // Allow process to exit when no active connections
    // Supabase's pgBouncer (port 6543) certificate is trusted on recent versions.
    // If you get certificate errors, use DIRECT_URL (port 5432) instead.
    ssl: process.env.NODE_ENV === "production" ? true : false,
  });

  // Handle pool errors gracefully
  pool.on("error", (err) => {
    console.error("Unexpected pool error:", err);
  });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Store pool reference for potential cleanup
  globalForPrisma.pool = pool;

  return prisma;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Graceful shutdown handler (useful for local development)
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    await db.$disconnect();
    await globalForPrisma.pool?.end();
  });
}
