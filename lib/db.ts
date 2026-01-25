import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Accept self-signed certificates from Supabase Pooler in production
if (process.env.NODE_ENV === "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

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
    // FIX: Supabase Transaction Pooler (Port 6543) uses a self-signed cert.
    // We must set rejectUnauthorized: false to avoid "self-signed certificate" errors
    // during Vercel deployment. (Fixed Jan 2026)
    ssl: {
      rejectUnauthorized: false, // Accept self-signed certificates from Supabase Pooler
    },
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
