import { appRouter } from '../_app';
import { inferProcedureInput } from '@trpc/server';
import { vi } from 'vitest';



// Helper to create a mock context for tRPC
export const createMockContext = (overrides = {}) => {
  const userId = overrides.userId || 'user-1';
  const clerkId = overrides.clerkId || 'clerk-1';
  // Allow test to inject a userDb array for user lookups
  const userDb = overrides.userDb || [];
  return {
    session: { userId },
    user: { id: userId, clerkId, email: 'test@example.com', role: 'USER' },
    db: {
      flight: {
        create: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        groupBy: vi.fn(),
        findMany: vi.fn(),
      },
      aircraft: {
        create: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(async ({ where }) => {
          if (where.id) return userDb.find(u => u.id === where.id) ?? null;
          if (where.clerkId) return userDb.find(u => u.clerkId === where.clerkId) ?? null;
          return null;
        }),
        create: vi.fn(async ({ data }) => ({ ...data, id: userId })),
        update: vi.fn(({ where, data }) => {
          // Only allow update if the user matches the current context user
          const idx = userDb.findIndex(u => (where.id && u.id === where.id) || (where.clerkId && u.clerkId === where.clerkId));
          if (idx === -1) throw new Error('User not found');
          // Simulate security: only allow update if where.id matches session userId
          if (where.id && where.id !== userId) throw new Error('Unauthorized update');
          userDb[idx] = { ...userDb[idx], ...data };
          return userDb[idx];
        }),
        delete: vi.fn(),
      },
      // Add more models/methods as needed for your procedures
    },
    ...overrides,
  };
};

// tRPC v10: Use appRouter.createCaller(ctx)
export function createTestCaller(ctx) {
  return appRouter.createCaller(ctx);
}

export type { inferProcedureInput };