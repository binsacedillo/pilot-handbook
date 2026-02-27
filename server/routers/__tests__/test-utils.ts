import { appRouter } from '../_app';
import { inferProcedureInput } from '@trpc/server';
import { vi } from 'vitest';


type MinimalUser = { id: string; clerkId: string } & Record<string, unknown>;
type Overrides = {
  userId?: string;
  clerkId?: string;
  userDb?: MinimalUser[];
} & Record<string, unknown>;

// Helper to create a mock context for tRPC
export const createMockContext = (overrides: Overrides = {}) => {
  const userId = overrides.userId ?? 'user-1';
  const clerkId = overrides.clerkId ?? 'clerk-1';
  // Allow test to inject a userDb array for user lookups
  const userDb: MinimalUser[] = overrides.userDb ?? [];
  return {
    session: { userId: clerkId }, // session.userId is the Clerk ID
    user: { id: userId, clerkId, email: 'test@example.com', role: overrides.role ?? 'USER' },
    db: {
      flight: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        groupBy: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      aircraft: {
        create: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findUnique: vi.fn(async ({ where }: { where: { id?: string; clerkId?: string } }) => {
          if (where.id) return userDb.find((u: MinimalUser) => u.id === where.id) ?? null;
          if (where.clerkId) return userDb.find((u: MinimalUser) => u.clerkId === where.clerkId) ?? null;
          return null;
        }),
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ ...data, id: userId })),
        update: vi.fn(({ where, data }: { where: { id?: string; clerkId?: string }; data: Partial<MinimalUser> }) => {
          // Only allow update if the user matches the current context user
          const idx = userDb.findIndex((u: MinimalUser) => (where.id && u.id === where.id) || (where.clerkId && u.clerkId === where.clerkId));
          if (idx === -1) throw new Error('User not found');
          // Simulate security: only allow update if where.id matches session userId
          if (where.id && where.id !== userId) throw new Error('Unauthorized update');
          const current = userDb[idx] as MinimalUser;
          userDb[idx] = { ...current, ...data, id: current.id, clerkId: current.clerkId };
          return userDb[idx];
        }),
        upsert: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      userPreferences: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      // Add more models/methods as needed for your procedures
    },
    ...overrides,
  };
};

// tRPC v10: Use appRouter.createCaller(ctx)
export function createTestCaller(ctx: Record<string, unknown>) {
  return appRouter.createCaller(ctx as Parameters<typeof appRouter.createCaller>[0]);
}

export type { inferProcedureInput };