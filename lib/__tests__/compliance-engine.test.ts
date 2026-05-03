import { describe, it, expect, vi } from 'vitest';
import { calculateCurrency, FlightRecord } from '../compliance-engine';

describe('Compliance Engine', () => {
  const now = new Date('2026-05-03T12:00:00Z');

  // Helper to create a date relative to "now"
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  it('should identify a current pilot with 3 landings in 90 days', () => {
    const flights: FlightRecord[] = [
      { date: daysAgo(10), dayLandings: 1, nightLandings: 0, duration: 1.5 },
      { date: daysAgo(10), dayLandings: 1, nightLandings: 0, duration: 1.5 },
      { date: daysAgo(10), dayLandings: 1, nightLandings: 0, duration: 1.5 },
    ];

    // Mock Date.now() for consistency
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const status = calculateCurrency(flights);

    expect(status.isCurrentForPassengers).toBe(true);
    expect(status.isNightCurrent).toBe(false);
    expect(status.totalLandingsLast90Days).toBe(3);
    expect(status.daysUntilExpiry).toBe(80); // 90 days from 10 days ago = 80 days left

    vi.useRealTimers();
  });

  it('should identify a non-current pilot with fewer than 3 landings', () => {
    const flights: FlightRecord[] = [
      { date: daysAgo(10), dayLandings: 2, nightLandings: 0, duration: 1.0 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(now);

    const status = calculateCurrency(flights);

    expect(status.isCurrentForPassengers).toBe(false);
    expect(status.requirementsMissing).toContain('Need 1 more landings for passenger carrying.');

    vi.useRealTimers();
  });

  it('should correctly handle night currency', () => {
    const flights: FlightRecord[] = [
      { date: daysAgo(20), dayLandings: 0, nightLandings: 3, duration: 2.0 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(now);

    const status = calculateCurrency(flights);

    expect(status.isCurrentForPassengers).toBe(true);
    expect(status.isNightCurrent).toBe(true);
    expect(status.totalLandingsLast90Days).toBe(3);
    expect(status.nightLandingsLast90Days).toBe(3);

    vi.useRealTimers();
  });

  it('should ignore flights older than 90 days', () => {
    const flights: FlightRecord[] = [
      { date: daysAgo(95), dayLandings: 10, nightLandings: 10, duration: 5.0 },
      { date: daysAgo(10), dayLandings: 1, nightLandings: 0, duration: 1.0 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(now);

    const status = calculateCurrency(flights);

    expect(status.isCurrentForPassengers).toBe(false);
    expect(status.totalLandingsLast90Days).toBe(1);

    vi.useRealTimers();
  });

  it('should calculate expiry based on the 3rd most recent landing', () => {
    const flights: FlightRecord[] = [
      { date: daysAgo(10), dayLandings: 1, nightLandings: 0, duration: 1 },
      { date: daysAgo(20), dayLandings: 1, nightLandings: 0, duration: 1 },
      { date: daysAgo(30), dayLandings: 1, nightLandings: 0, duration: 1 }, // 3rd most recent
      { date: daysAgo(40), dayLandings: 1, nightLandings: 0, duration: 1 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(now);

    const status = calculateCurrency(flights);

    // 90 days from 30 days ago = 60 days from now
    expect(status.daysUntilExpiry).toBe(60);

    vi.useRealTimers();
  });

  it('should handle multiple landings in a single flight', () => {
    const flights: FlightRecord[] = [
      { date: daysAgo(5), dayLandings: 5, nightLandings: 2, duration: 3.0 },
    ];

    const status = calculateCurrency(flights);

    expect(status.isCurrentForPassengers).toBe(true);
    expect(status.totalLandingsLast90Days).toBe(7);
  });
});
