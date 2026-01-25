import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Use in-memory SQLite for true isolation and speed
// "file::memory:?cache=shared" keeps it in RAM and allows sharing across instances
process.env.DATABASE_URL = 'file:./test.db'; 
// Alternative for pure in-memory (faster, but resets per connection):
// process.env.DATABASE_URL = 'file:memory:?cache=shared';

export const prismaTest =
  globalForPrisma.prisma ||
  new PrismaClient(); // No options needed — it reads DATABASE_URL

if (process.env.NODE_ENV === 'test') {
  globalForPrisma.prisma = prismaTest;
}
