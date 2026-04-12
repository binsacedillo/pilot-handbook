import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  
  // Direct SSL check for Neon/Hosted Postgres
  const shouldUseSsl =
    process.env.NODE_ENV === "production" ||
    databaseUrl.includes("sslmode=") ||
    databaseUrl.includes(".neon.tech");

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10, // Increased for stability
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: shouldUseSsl,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  globalForPrisma.pool = pool;
  return prisma;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
