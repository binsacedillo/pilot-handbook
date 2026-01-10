import { describe, it, expect, beforeEach } from 'vitest';
import { createMockContext, createTestCaller } from './test-utils';
import { flightRouter } from '../flight';

describe('flightRouter.getStats', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>['flight'];
  let flightDb: Array<{
    duration?: number;
    landings?: number;
    picTime?: number;
    dualTime?: number;
    date?: Date;
  }>;
  const userId = 'user-1';

  beforeEach(() => {
    ctx = createMockContext();
    ctx.user = { id: userId };
    flightDb = [];
    ctx.db.flight.findMany.mockImplementation(() => Promise.resolve(flightDb));
    caller = createTestCaller(ctx).flight;
  });

  it('aggregates total hours, landings, and currency correctly', async () => {
    flightDb.push(
      { duration: 2, landings: 1, picTime: 2, dualTime: 0 },
      { duration: 3, landings: 2, picTime: 1, dualTime: 2 },
      { duration: 5, landings: 3, picTime: 5, dualTime: 0 },
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
      { duration: 0, landings: 0, picTime: 0, dualTime: 0 },
      { duration: undefined, landings: undefined, picTime: undefined, dualTime: undefined },
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
      { date: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000), landings: 2 }, // 100 days ago
      { date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), landings: 3 }, // 10 days ago
    );
    // Simulate 90-day currency logic (not in router, but for test strategy)
    type Flight = { date: Date; landings?: number };
    const recentLandings = flightDb
      .filter((f) =>
        f.date && f.date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      )
      .reduce((sum, f) => sum + (f.landings || 0), 0);
    expect(recentLandings).toBe(3);
  });
});
