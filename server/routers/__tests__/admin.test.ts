import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createMockContext, createTestCaller } from './test-utils';

// Mock external dependencies
vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(() => ({
    users: {
      updateUserMetadata: vi.fn(),
      updateUser: vi.fn(),
    },
  })),
}));

vi.mock('@/lib/audit-logger', () => ({
  createAuditLog: vi.fn(),
  getAuditLogs: vi.fn(),
}));

const ADMIN_USER_ID = 'admin-1';
const ADMIN_CLERK_ID = 'clerk-admin-1';
const TARGET_USER_ID = 'user-2';
const TARGET_CLERK_ID = 'clerk-user-2';

const adminUser = {
  id: ADMIN_USER_ID,
  clerkId: ADMIN_CLERK_ID,
  role: 'ADMIN',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  license: null as string | null,
  licenseExpiry: null as Date | null,
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-01'),
};

const targetUser = {
  id: TARGET_USER_ID,
  clerkId: TARGET_CLERK_ID,
  role: 'USER',
  email: 'user@example.com',
  firstName: 'Regular',
  lastName: 'User',
  license: 'PPL123' as string | null,
  licenseExpiry: new Date('2030-01-01') as Date | null,
  createdAt: new Date('2021-01-01'),
  updatedAt: new Date('2021-01-01'),
};

describe('Admin Router', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>['admin'];
  let userDb: typeof adminUser[];

  beforeEach(() => {
    vi.clearAllMocks();
    userDb = [{ ...adminUser }, { ...targetUser }];
    
    ctx = createMockContext({
      userId: ADMIN_USER_ID,
      clerkId: ADMIN_CLERK_ID,
      role: 'ADMIN',
      userDb,
    });

    // Setup mock implementations
    // adminProcedure needs to find the admin user by clerkId (session.userId)
    ctx.db.user.findUnique.mockImplementation(async ({ where }) => {
      // For adminProcedure validation, return admin when queried by clerkId
      if (where.clerkId === ADMIN_CLERK_ID) {
        return { id: ADMIN_USER_ID, role: 'ADMIN', email: 'admin@example.com', clerkId: ADMIN_CLERK_ID };
      }
      return userDb.find(u => 
        (where.id && u.id === where.id) || 
        (where.clerkId && u.clerkId === where.clerkId)
      ) ?? null;
    });

    ctx.db.user.update.mockImplementation(({ where, data }) => {
      const idx = userDb.findIndex(u =>
        (where.id && u.id === where.id) || 
        (where.clerkId && u.clerkId === where.clerkId)
      );
      if (idx === -1) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      const current = userDb[idx]!; // Safe: we just checked idx !== -1
      const updated = { ...current, ...data, id: current.id, clerkId: current.clerkId };
      userDb[idx] = updated;
      return updated;
    });

    ctx.db.user.delete.mockImplementation(({ where }) => {
      const idx = userDb.findIndex(u => u.id === where.id);
      if (idx === -1) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      const deleted = userDb[idx];
      userDb.splice(idx, 1);
      return deleted;
    });

    ctx.db.user.findMany.mockImplementation(async ({ skip = 0, take = 10 }) => {
      return userDb.slice(skip, skip + take);
    });

    ctx.db.user.count.mockResolvedValue(userDb.length);
    ctx.db.flight.count.mockResolvedValue(42);
    ctx.db.aircraft.count.mockResolvedValue(5);

    caller = createTestCaller(ctx).admin;
  });

  describe('getStats', () => {
    it('should return system stats (users, flights, aircraft)', async () => {
      const stats = await caller.getStats();

      expect(stats).toEqual({
        totalUsers: 2,
        totalFlights: 42,
        totalAircraft: 5,
      });

      expect(ctx.db.user.count).toHaveBeenCalled();
      expect(ctx.db.flight.count).toHaveBeenCalled();
      expect(ctx.db.aircraft.count).toHaveBeenCalled();
    });
  });

  describe('recentUsers', () => {
    it('should return the 5 most recent users', async () => {
      const recentUser = {
        ...targetUser,
        id: 'user-new',
        createdAt: new Date('2026-01-15'),
      };
      userDb.push(recentUser);

      ctx.db.user.findMany.mockResolvedValue([recentUser, targetUser, adminUser].slice(0, 5));

      const result = await caller.recentUsers();

      expect(result).toHaveLength(3);
      expect(ctx.db.user.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users with total count', async () => {
      const result = await caller.getAllUsers({ skip: 0, take: 10 });

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(ctx.db.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should use default pagination if no input provided', async () => {
      const result = await caller.getAllUsers({});

      expect(result.users).toBeDefined();
      expect(result.total).toBe(2);
    });
  });

  describe('verifyPilot', () => {
    it('should change user role from USER to PILOT when verified=true', async () => {
      const { createAuditLog } = await import('@/lib/audit-logger');

      const result = await caller.verifyPilot({
        userId: TARGET_USER_ID,
        verified: true,
      });

      expect(result.role).toBe('PILOT');
      expect(ctx.db.user.update).toHaveBeenCalledWith({
        where: { id: TARGET_USER_ID },
        data: { role: 'PILOT' },
      });
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: ADMIN_USER_ID,
          action: 'VERIFY',
          entityType: 'User',
          entityId: TARGET_USER_ID,
        })
      );
    });

    it('should change role from PILOT to USER when verified=false', async () => {
      const targetUserInDb = userDb[1];
      if (targetUserInDb) {
        targetUserInDb.role = 'PILOT'; // Set target user to PILOT first
      }

      const result = await caller.verifyPilot({
        userId: TARGET_USER_ID,
        verified: false,
      });

      expect(result.role).toBe('USER');
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      await expect(
        caller.verifyPilot({ userId: 'non-existent', verified: true })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role in DB and sync to Clerk', async () => {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const { createAuditLog } = await import('@/lib/audit-logger');
      const mockClerkClient = {
        users: {
          updateUserMetadata: vi.fn(),
        },
      };
      (clerkClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockClerkClient);

      const result = await caller.updateUserRole({
        userId: TARGET_USER_ID,
        role: 'PILOT',
      });

      expect(result.role).toBe('PILOT');
      expect(ctx.db.user.update).toHaveBeenCalledWith({
        where: { id: TARGET_USER_ID },
        data: { role: 'PILOT' },
      });
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        TARGET_CLERK_ID,
        {
          publicMetadata: { role: 'PILOT' },
        }
      );
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ROLE_CHANGE',
          oldValues: { role: 'USER' },
          newValues: { role: 'PILOT' },
        })
      );
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      await expect(
        caller.updateUserRole({ userId: 'non-existent', role: 'ADMIN' })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and create audit log', async () => {
      const { createAuditLog } = await import('@/lib/audit-logger');

      const result = await caller.deleteUser({ userId: TARGET_USER_ID });

      expect(result.id).toBe(TARGET_USER_ID);
      expect(ctx.db.user.delete).toHaveBeenCalledWith({
        where: { id: TARGET_USER_ID },
      });
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          entityType: 'User',
          entityId: TARGET_USER_ID,
        })
      );
      expect(userDb).toHaveLength(1); // Only admin left
    });

    it('should throw FORBIDDEN when admin tries to delete themselves', async () => {
      await expect(
        caller.deleteUser({ userId: ADMIN_USER_ID })
      ).rejects.toThrow(TRPCError);

      await expect(
        caller.deleteUser({ userId: ADMIN_USER_ID })
      ).rejects.toThrow('Cannot delete your own account');
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      await expect(
        caller.deleteUser({ userId: 'non-existent' })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs with filters', async () => {
      const { getAuditLogs } = await import('@/lib/audit-logger');
      const mockLogs = [
        {
          id: 'log-1',
          userId: ADMIN_USER_ID,
          action: 'ROLE_CHANGE',
          entityType: 'User',
          entityId: TARGET_USER_ID,
          timestamp: new Date(),
        },
      ];
      (getAuditLogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockLogs);

      const result = await caller.getAuditLogs({
        action: 'ROLE_CHANGE',
        limit: 50,
        skip: 0,
      });

      expect(result).toEqual(mockLogs);
      expect(getAuditLogs).toHaveBeenCalledWith({
        action: 'ROLE_CHANGE',
        startDate: undefined,
        endDate: undefined,
        limit: 50,
        skip: 0,
      });
    });

    it('should cap limit at 500 to prevent abuse', async () => {
      const { getAuditLogs } = await import('@/lib/audit-logger');
      (getAuditLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await caller.getAuditLogs({ limit: 1000 });

      expect(getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 500, // Capped at 500
        })
      );
    });
  });
});
