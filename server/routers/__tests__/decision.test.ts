import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockContext, createTestCaller } from './test-utils';
import { TRPCError } from '@trpc/server';

describe('Decision Router', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>['decision'];
  const userId = 'user-1';

  beforeEach(() => {
    ctx = createMockContext();
    ctx.user = {
      id: userId,
      clerkId: 'clerk-1',
      email: 'pilot@example.com',
      role: 'USER',
    };
    caller = createTestCaller(ctx).decision;
  });

  describe('logSnapshot', () => {
    it('should successfully log a safety snapshot', async () => {
      const input = {
        type: 'DENSITY_ALTITUDE' as const,
        aircraftId: 'aircraft-1',
        inputs: { temp: 30, alt: 5000 },
        results: { densityAlt: 7500 },
        status: 'CAUTION',
        reason: 'High density altitude',
        recommendation: 'Reduce takeoff weight',
      };

      ctx.db.safetySnapshot.create.mockResolvedValue({
        id: 'snapshot-1',
        ...input,
        userId,
        calculatedAt: new Date(),
      });

      const result = await caller.logSnapshot(input);

      expect(result.success).toBe(true);
      expect(result.id).toBe('snapshot-1');
      expect(ctx.db.safetySnapshot.create).toHaveBeenCalledWith({
        data: {
          ...input,
          userId,
        },
      });
    });

    it('should throw UNAUTHORIZED if user is not logged in', async () => {
      ctx.session.userId = null;
      
      const input = {
        type: 'FUEL' as const,
        inputs: {},
        results: {},
        status: 'OK',
      };

      await expect(caller.logSnapshot(input)).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      const input = {
        type: 'WEIGHT_BALANCE' as const,
        inputs: {},
        results: {},
        status: 'OK',
      };

      ctx.db.safetySnapshot.create.mockRejectedValue(new Error('DB Error'));

      await expect(caller.logSnapshot(input)).rejects.toThrow(/Could not save safety snapshot/);
    });
  });

  describe('getHistory', () => {
    it('should retrieve snapshot history for the user', async () => {
      const mockHistory = [
        { id: '1', type: 'FUEL', status: 'OK', calculatedAt: new Date() },
        { id: '2', type: 'WEIGHT_BALANCE', status: 'OK', calculatedAt: new Date() },
      ];

      ctx.db.safetySnapshot.findMany.mockResolvedValue(mockHistory);

      const result = await caller.getHistory({ limit: 5 });

      expect(result).toHaveLength(2);
      expect(ctx.db.safetySnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          take: 5,
          orderBy: { calculatedAt: 'desc' },
        })
      );
    });

    it('should throw UNAUTHORIZED for unauthenticated users', async () => {
      ctx.session.userId = null;
      await expect(caller.getHistory({})).rejects.toThrow();
    });
  });
});
