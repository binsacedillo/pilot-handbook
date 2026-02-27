import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createMockContext, createTestCaller } from './test-utils';

// Mock Clerk client - must include currentUser for protectedProcedure
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn().mockResolvedValue({
    id: 'clerk-1',
    primaryEmailAddress: { emailAddress: 'test@example.com' },
  }),
  clerkClient: vi.fn(() => ({
    users: {
      getUser: vi.fn().mockResolvedValue({
        id: 'clerk-1',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
      }),
      updateUser: vi.fn().mockResolvedValue({
        id: 'clerk-1',
        unsafeMetadata: { theme: 'LIGHT' },
      }),
    },
  })),
}));

const TEST_USER_ID = 'user-1';
const TEST_CLERK_ID = 'clerk-1';

const mockPreferences = {
  id: 'pref-1',
  userId: TEST_USER_ID,
  theme: 'SYSTEM' as const,
  unitSystem: 'METRIC' as const,
  currency: 'USD',
  defaultAircraftId: null as string | null,
  favoriteAirport: 'KJFK' as string | null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('Preferences Router', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>['preferences'];

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset Clerk currentUser mock to return valid user by default
    const { currentUser } = await import('@clerk/nextjs/server');
    vi.mocked(currentUser).mockResolvedValue({
      id: TEST_CLERK_ID,
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    } as unknown as Awaited<ReturnType<typeof currentUser>>);
    
    ctx = createMockContext({
      userId: TEST_USER_ID,
      clerkId: TEST_CLERK_ID,
    });

    // Setup default mock implementations
    ctx.db.userPreferences.findUnique.mockResolvedValue(null);
    ctx.db.userPreferences.upsert.mockImplementation(async ({ where, update, create }) => {
      return {
        ...mockPreferences,
        ...create,
        ...update,
        userId: where.userId,
      } as typeof mockPreferences;
    });

    caller = createTestCaller(ctx).preferences;
  });

  describe('getPreferences', () => {
    it('should return user preferences if they exist', async () => {
      ctx.db.userPreferences.findUnique.mockResolvedValue(mockPreferences);

      const result = await caller.getPreferences();

      expect(result).toEqual(mockPreferences);
      expect(ctx.db.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID },
      });
    });

    it('should return default preferences if none exist', async () => {
      ctx.db.userPreferences.findUnique.mockResolvedValue(null);

      const result = await caller.getPreferences();

      expect(result).toEqual({
        theme: 'SYSTEM',
        unitSystem: 'METRIC',
        currency: 'USD',
        defaultAircraftId: null,
        favoriteAirport: 'KJFK',
      });
    });

    it('should throw UNAUTHORIZED if user not in context', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      vi.mocked(currentUser).mockResolvedValue(null);

      await expect(caller.getPreferences()).rejects.toThrow(TRPCError);
      await expect(caller.getPreferences()).rejects.toThrow('User not found in Clerk');
    });
  });

  describe('updatePreferences', () => {
    it('should update theme preference and sync to Clerk', async () => {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const mockClerkClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            publicMetadata: {},
          }),
          updateUser: vi.fn().mockResolvedValue({}),
        },
      };
      (clerkClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockClerkClient);

      const result = await caller.updatePreferences({
        theme: 'DARK',
      });

      expect(result.theme).toBe('DARK');
      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith(TEST_CLERK_ID);
      expect(mockClerkClient.users.updateUser).toHaveBeenCalledWith(
        TEST_CLERK_ID,
        {
          publicMetadata: {
            theme: 'DARK',
            unitSystem: undefined,
          },
        }
      );
      expect(ctx.db.userPreferences.upsert).toHaveBeenCalled();
    });

    it('should update unitSystem preference', async () => {
      const result = await caller.updatePreferences({
        unitSystem: 'IMPERIAL',
      });

      expect(result.unitSystem).toBe('IMPERIAL');
      expect(ctx.db.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID },
        update: { unitSystem: 'IMPERIAL' },
        create: expect.objectContaining({
          userId: TEST_USER_ID,
          unitSystem: 'IMPERIAL',
        }),
      });
    });

    it('should update multiple preferences at once', async () => {
      const result = await caller.updatePreferences({
        theme: 'LIGHT',
        unitSystem: 'IMPERIAL',
        currency: 'EUR',
        favoriteAirport: 'EGLL',
      });

      expect(result.theme).toBe('LIGHT');
      expect(result.unitSystem).toBe('IMPERIAL');
      expect(result.currency).toBe('EUR');
      expect(result.favoriteAirport).toBe('EGLL');
    });

    it('should handle Clerk sync failure gracefully (non-blocking)', async () => {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const mockClerkClient = {
        users: {
          getUser: vi.fn().mockRejectedValue(new Error('Clerk API error')),
          updateUser: vi.fn(),
        },
      };
      (clerkClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockClerkClient);

      // Should not throw, just log error
      const result = await caller.updatePreferences({
        theme: 'DARK',
      });

      expect(result.theme).toBe('DARK');
      expect(ctx.db.userPreferences.upsert).toHaveBeenCalled();
    });

    it('should validate favoriteAirport format (4 chars, uppercase)', async () => {
      // Valid: 4 chars
      const validResult = await caller.updatePreferences({
        favoriteAirport: 'KJFK',
      });
      expect(validResult.favoriteAirport).toBe('KJFK');

      // Auto-uppercase
      const uppercaseResult = await caller.updatePreferences({
        favoriteAirport: 'egll',
      });
      expect(uppercaseResult.favoriteAirport).toBe('EGLL');

      // Invalid: too short
      await expect(
        caller.updatePreferences({ favoriteAirport: 'LAX' })
      ).rejects.toThrow();

      // Invalid: too long
      await expect(
        caller.updatePreferences({ favoriteAirport: 'KJFKX' })
      ).rejects.toThrow();
    });

    it('should allow nullable defaultAircraftId and favoriteAirport', async () => {
      const result = await caller.updatePreferences({
        defaultAircraftId: null,
        favoriteAirport: null,
      });

      expect(result.defaultAircraftId).toBeNull();
      expect(result.favoriteAirport).toBeNull();
    });

    it('should throw UNAUTHORIZED if user not in context', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      vi.mocked(currentUser).mockResolvedValue(null);

      await expect(
        caller.updatePreferences({ theme: 'DARK' })
      ).rejects.toThrow(TRPCError);
    });
  });
});
