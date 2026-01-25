import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createMockContext, createTestCaller } from './test-utils';

const TEST_USER_ID = 'user-1';
const TEST_CLERK_ID = 'clerk-1';

const baseUser = {
  id: TEST_USER_ID,
  clerkId: TEST_CLERK_ID,
  role: 'USER',
  email: 'test@example.com',
  firstName: 'Jane' as string | null,
  lastName: 'Doe' as string | null,
  license: 'PPL123' as string | null,
  licenseExpiry: new Date('2030-01-01') as Date | null,
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-01'),
  userPreferences: null,
};

let userDb: typeof baseUser[];

describe('userRouter', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>['user'];

  beforeEach(() => {
    userDb = [{ ...baseUser }]; // always reset to baseUser
    ctx = createMockContext({ userDb, userId: TEST_USER_ID, clerkId: TEST_CLERK_ID });
    // findUnique: dual-key (id or clerkId)
    ctx.db.user.findUnique.mockImplementation(async ({ where }) => {
      return userDb.find(u => (where.id && u.id === where.id) || (where.clerkId && u.clerkId === where.clerkId)) ?? null;
    });
    // update: dual-key (id or clerkId), throw TRPCError if not found
    ctx.db.user.update.mockImplementation(({ where, data }: { where: { id?: string; clerkId?: string }, data: Partial<typeof baseUser> }) => {
      const idx = userDb.findIndex(u =>
        (where.id && u.id === where.id) || (where.clerkId && u.clerkId === where.clerkId)
      );
      if (idx === -1) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      const current = userDb[idx] as typeof baseUser;
      const updatedUser = { ...current, ...data, id: current.id, clerkId: current.clerkId } as typeof baseUser;
      userDb[idx] = updatedUser;
      return updatedUser;
    });
    // upsert: always search by clerkId
    ctx.db.user.upsert.mockImplementation(({ where, create, update }: { where: { clerkId: string }, create: Partial<typeof baseUser>, update: Partial<typeof baseUser> }) => {
      const user = userDb.find(u => u.clerkId === where.clerkId);
      if (user) {
        Object.assign(user, update);
        return Promise.resolve(user);
      } else {
        const newUser = { ...baseUser, ...create, clerkId: where.clerkId } as typeof baseUser;
        userDb.push(newUser);
        return Promise.resolve(newUser);
      }
    });
    caller = createTestCaller(ctx).user;
  });

  it('getProfile returns the baseUser', async () => {
    const result = await caller.getProfile();

    // Guard + explicit assertion (TS now narrows result to User)
    expect(result).not.toBeNull();
    expect(result).toBeDefined();

    type User = typeof baseUser;

    // Type guard function (helps TS narrow deeply)
    function isUser(u: unknown): u is User {
      return u !== null && u !== undefined;
    }

    if (!isUser(result)) {
      throw new Error('Profile result is null'); // fails test clearly
    }

    // Normalize date fields for comparison
    const normalize = (u: Record<string, unknown>) => ({
      ...u,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
      licenseExpiry: u.licenseExpiry instanceof Date ? u.licenseExpiry.toISOString() : u.licenseExpiry,
    });

    // Now TS knows result is User (non-null)
    const normalizedResult = normalize(result as Record<string, unknown>);
    const normalizedBase = normalize(baseUser);

    // Safe match
    expect(normalizedResult).toMatchObject(normalizedBase);
  });

  it('updateProfile updates firstName and license', async () => {
    const updated = await caller.updateProfile({ firstName: 'John', license: 'ATP999' });
    expect(updated.firstName).toBe('John');
    expect(updated.license).toBe('ATP999');
  });

  it('getOrCreate creates a new user if not found', async () => {
    ctx.user = { id: 'user-2', clerkId: 'clerk-2', role: 'USER', email: 'new@example.com' };
    ctx.db.user.findUnique.mockResolvedValueOnce(null);
    const newUser = { ...baseUser, id: 'user-2', clerkId: 'clerk-2', email: 'new@example.com' };
    ctx.db.user.create.mockResolvedValueOnce(newUser);
    const newCaller = createTestCaller({ ...ctx, user: { id: 'user-2', clerkId: 'clerk-2', role: 'USER', email: 'new@example.com' } }).user;
    const result = await newCaller.getOrCreate();

    // Guard + explicit assertion (TS now narrows result)
    expect(result).not.toBeNull();
    expect(result).toBeDefined();

    type User = typeof baseUser;

    // Type guard function (helps TS narrow deeply)
    function isUser(u: unknown): u is User {
      return u !== null && u !== undefined;
    }

    if (!isUser(result)) {
      throw new Error('getOrCreate result is null');
    }

    // Now TS knows result is User (non-null)
    expect(result.id).toBe('user-2');
  });

  // 1. getOrCreate returns existing user if found
  it('getOrCreate returns existing user if found', async () => {
    // Mock findUnique to return the existing baseUser
    vi.mocked(ctx.db.user.findUnique).mockResolvedValueOnce(baseUser);

    // Create fresh caller with matching context
    const freshCaller = createTestCaller({
      ...ctx,
      user: {
        id: baseUser.id,
        clerkId: baseUser.clerkId,
        role: baseUser.role,
        email: baseUser.email,
      },
    }).user;

    const result = await freshCaller.getOrCreate();
    expect(result).not.toBeNull();
    const user = result as typeof baseUser;
    expect(user.id).toBe(baseUser.id);
    expect(user.clerkId).toBe(baseUser.clerkId);
  });

  // 2. updateProfile does not allow changing another user
  it('updateProfile does not allow changing another user', async () => {
    // Create a fresh caller for the "hacker" user
    const hackerCaller = createTestCaller({
      ...ctx,
      user: {
        id: 'hacker-id',
        clerkId: 'hacker-clerk',
        role: 'USER',
        email: 'hacker@example.com',
      },
    }).user;

    // Mock findUnique to return a different user (owned by someone else)
    vi.mocked(ctx.db.user.findUnique).mockResolvedValueOnce({
      ...baseUser,
      id: 'victim-id',
      clerkId: 'victim-clerk',
    });

    // Expect unauthorized error
    await expect(
      hackerCaller.updateProfile({ firstName: 'Hacker' })
    ).rejects.toThrow(TRPCError);  // or .toThrow(/UNAUTHORIZED/)
  });

  // 3. findUnique returns null if not found
  it('findUnique returns null if not found', async () => {
    // Mock findUnique to return null
    vi.mocked(ctx.db.user.findUnique).mockResolvedValueOnce(null);

    // Direct Prisma call using ctx.db
    const result = await ctx.db.user.findUnique({ where: { id: 'not-exist' } });

    expect(result).toBeNull();
  });

  it('update throws if user not found', async () => {
    await expect(() => ctx.db.user.update({ where: { id: 'not-exist' }, data: {} })).toThrow();
  });

  it('upsert updates if user exists', async () => {
    const updated = await ctx.db.user.upsert({ where: { clerkId: baseUser.clerkId }, create: {}, update: { firstName: 'Updated' } });
    expect(updated.firstName).toBe('Updated');
  });

  it('upsert creates if user does not exist', async () => {
    const created = await ctx.db.user.upsert({ where: { clerkId: 'clerk-3' }, create: { ...baseUser, id: 'user-3', clerkId: 'clerk-3' }, update: {} });
    expect(created.id).toBe('user-3');
    expect(userDb.length).toBe(2);
  });
});
