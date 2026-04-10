import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  
  // Generic SSL check for hosted Postgres services like Neon
  const shouldUseSsl =
    process.env.NODE_ENV === "production" ||
    databaseUrl.includes("sslmode=") ||
    databaseUrl.includes(".neon.tech") ||
    databaseUrl.includes(".supabase.co");

  const pool = new Pool({
    connectionString: databaseUrl,
    // Serverless-optimized settings
    max: 3, 
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
    ssl: shouldUseSsl,
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
