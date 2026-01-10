import { appRouter } from '../_app';
import { inferProcedureInput } from '@trpc/server';
import { vi } from 'vitest';



// Helper to create a mock context for tRPC
export const createMockContext = (overrides = {}) => {
  const userId = 'pilot-1';
  return {
    session: { userId },
    user: { id: userId, email: 'test@example.com' },
    db: {
      flight: {
        create: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      },
      aircraft: {
        create: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(async ({ where }) => (where.clerkId === userId ? { id: userId, role: 'user', email: 'test@example.com' } : null)),
        create: vi.fn(async ({ data }) => ({ ...data, id: userId })),
        update: vi.fn(),
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