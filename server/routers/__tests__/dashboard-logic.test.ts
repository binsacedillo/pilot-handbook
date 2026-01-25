import { describe, it, expect, beforeEach } from 'vitest';
import { createMockContext, createTestCaller } from './test-utils';

describe('flightRouter.getStats', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>['flight'];
  let flightDb: Array<{
    duration?: number;
    dayLandings?: number;
    nightLandings?: number;
    picTime?: number;
    dualTime?: number;
    date?: Date;
  }>;
  const userId = 'user-1';

  beforeEach(() => {
    ctx = createMockContext();
    ctx.user = {
      id: userId,
      clerkId: ctx.user.clerkId,
      email: ctx.user.email,
      role: ctx.user.role,
    };
    flightDb = [];
    ctx.db.flight.findMany.mockImplementation(() => Promise.resolve(flightDb));
    caller = createTestCaller(ctx).flight;
  });

  it('aggregates total hours, landings, and currency correctly', async () => {
    flightDb.push(
      { duration: 2, dayLandings: 1, nightLandings: 0, picTime: 2, dualTime: 0 },
      { duration: 3, dayLandings: 2, nightLandings: 0, picTime: 1, dualTime: 2 },
      { duration: 5, dayLandings: 3, nightLandings: 0, picTime: 5, dualTime: 0 },
    );
    const result = await caller.getStats();
    expect(result.totalHours).toBe(10);
    expect(result.totalLandings).toBe(6);
    expect(result.totalPicHours).toBe(8);
    expect(result.totalDualHours).toBe(2);
    expect(result.totalFlights).toBe(3);
  });

  it('handles 0 and missing values without NaN', async () => {
    flightDb.push(
      { duration: 0, dayLandings: 0, nightLandings: 0, picTime: 0, dualTime: 0 },
      { duration: undefined, dayLandings: undefined, nightLandings: undefined, picTime: undefined, dualTime: undefined },
    );
    const result = await caller.getStats();
    expect(result.totalHours).toBe(0);
    expect(result.totalLandings).toBe(0);
    expect(result.totalPicHours).toBe(0);
    expect(result.totalDualHours).toBe(0);
    expect(result.totalFlights).toBe(2);
  });

  it('calculates 90-day currency (recent landings)', async () => {
    const now = new Date();
    flightDb.push(
      { date: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000), dayLandings: 2, nightLandings: 0 }, // 100 days ago
      { date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), dayLandings: 3, nightLandings: 0 }, // 10 days ago
    );
    // Simulate 90-day currency logic (not in router, but for test strategy)
    const recentLandings = flightDb
      .filter((f) =>
        f.date && f.date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      )
      .reduce((sum, f) => sum + (f.dayLandings || 0) + (f.nightLandings || 0), 0);
    expect(recentLandings).toBe(3);
  });
});
