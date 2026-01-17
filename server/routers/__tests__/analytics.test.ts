import { describe, it, expect, beforeEach } from 'vitest';
import { createMockContext, createTestCaller } from './test-utils';

describe('statsRouter', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>["stats"];
  const userId = 'user-1';

  beforeEach(() => {
    ctx = createMockContext();
    ctx.user = {
      id: userId,
      clerkId: ctx.user.clerkId,
      email: ctx.user.email,
      role: ctx.user.role,
    };
    caller = createTestCaller(ctx).stats;
  });

  it('aggregates total hours from multiple flights', async () => {
    ctx.db.flight.groupBy.mockResolvedValue([
      { aircraftId: 'A1', _sum: { duration: 2 } },
      { aircraftId: 'A2', _sum: { duration: 3 } },
      { aircraftId: 'A3', _sum: { duration: 5 } },
    ]);
    ctx.db.aircraft.findUnique.mockResolvedValue({ model: 'Cessna' });
    const result = await caller.getHoursByType();
    expect(result.reduce((sum, r) => sum + r.totalHours, 0)).toBe(10);
  });

  it('returns 0 for total hours if no flights', async () => {
    ctx.db.flight.groupBy.mockResolvedValue([]);
    const result = await caller.getHoursByType();
    expect(result).toEqual([]);
  });

  it('returns correct summary for flights', async () => {
    ctx.db.flight.findMany.mockResolvedValue([
      { duration: 2, date: new Date() },
      { duration: 3, date: new Date() },
      { duration: 5, date: new Date() },
    ]);
    const result = await caller.getSummary();
    expect(result.totalHours).toBe(10);
    expect(result.totalFlights).toBe(3);
    expect(result.averageFlightHours).toBeCloseTo(3.33, 1);
  });

  it('handles 0 and missing values in summary', async () => {
    ctx.db.flight.findMany.mockResolvedValue([
      { duration: 0, date: new Date() },
      { duration: undefined, date: new Date() },
    ]);
    const result = await caller.getSummary();
    expect(result.totalHours).toBe(0);
    expect(result.totalFlights).toBe(2);
    expect(result.averageFlightHours).toBe(0);
  });

  it('returns hours by month for last 12 months', async () => {
    const now = new Date();
    ctx.db.flight.findMany.mockResolvedValue([
      { date: now, duration: 2 },
      { date: new Date(now.getFullYear(), now.getMonth() - 1, 1), duration: 3 },
    ]);
    const result = await caller.getHoursByMonth();
    expect(result.length).toBe(12);
    expect(result.some((m) => m.hours === 2 || m.hours === 3)).toBe(true);
  });

  // Add more tests for edge cases and currency logic as needed
});
