import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createMockContext, createTestCaller } from './test-utils';

const TEST_USER_ID = 'user-1';
const TEST_CLERK_ID = 'clerk-1';

const baseUser = {
  id: TEST_USER_ID,
  clerkId: TEST_CLERK_ID,
  role: 'USER',
  email: 'test@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  license: 'PPL123',
  licenseExpiry: new Date('2030-01-01'),
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
    ctx.db.user.update.mockImplementation(({ where, data }) => {
      const idx = userDb.findIndex(u =>
        (where.id && u.id === where.id) || (where.clerkId && u.clerkId === where.clerkId)
      );
      if (idx === -1) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      userDb[idx] = { ...userDb[idx], ...data };
      return userDb[idx];
    });
    // upsert: always search by clerkId
    ctx.db.user.upsert = ({ where, create, update }) => {
      const user = userDb.find(u => u.clerkId === where.clerkId);
      if (user) {
        Object.assign(user, update);
        return Promise.resolve(user);
      } else {
        const newUser = { ...create, clerkId: where.clerkId };
        userDb.push(newUser);
        return Promise.resolve(newUser);
      }
    };
    caller = createTestCaller(ctx).user;
  });

  it('getProfile returns the baseUser', async () => {
    const result = await caller.getProfile();
    // Normalize date fields for comparison
    type User = typeof baseUser;
    const normalize = (u: User | null) => u ? ({
      ...u,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
      licenseExpiry: u.licenseExpiry instanceof Date ? u.licenseExpiry.toISOString() : u.licenseExpiry,
    }) : null;
    expect(normalize(result as User | null)).toMatchObject(normalize(baseUser));
  });

  it('updateProfile updates firstName and license', async () => {
    const updated = await caller.updateProfile({ firstName: 'John', license: 'ATP999' });
    expect(updated.firstName).toBe('John');
    expect(updated.license).toBe('ATP999');
  });

  it('getOrCreate creates a new user if not found', async () => {
    ctx.user = { id: 'user-2', clerkId: 'clerk-2', role: 'USER' };
    ctx.db.user.findUnique.mockReturnValueOnce(null);
    const newUser = { ...baseUser, id: 'user-2', clerkId: 'clerk-2', email: 'new@example.com' };
    ctx.db.user.create.mockResolvedValueOnce(newUser);
    const newCaller = createTestCaller({ ...ctx, user: { id: 'user-2', clerkId: 'clerk-2', role: 'USER' } }).user;
    const result = await newCaller.getOrCreate();
    expect(result.id).toBe('user-2');
  });

  it('getOrCreate returns existing user if found', async () => {
    const result = await caller.getOrCreate();
    expect(result.id).toBe(baseUser.id);
  });

  it('updateProfile does not allow changing another user', async () => {
    // Create a new context and caller for a different user (the "hacker")
    const hackerCtx = createMockContext();
    hackerCtx.user = { id: 'hacker-id', clerkId: 'hacker-clerk', role: 'USER' };
    const hackerCaller = createTestCaller(hackerCtx).user;
    await expect(hackerCaller.updateProfile({ firstName: 'Hacker' })).rejects.toThrow();
  });

  it('findUnique returns null if not found', async () => {
    ctx.db.user.findUnique.mockReturnValueOnce(null);
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
