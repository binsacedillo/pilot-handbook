import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createMockContext, createTestCaller } from './test-utils';

// Mock global fetch for AVWX API calls
global.fetch = vi.fn();

const TEST_USER_ID = 'user-1';
const TEST_CLERK_ID = 'clerk-1';

const mockMetarResponse = {
  raw: 'KJFK 191851Z 31008KT 10SM FEW250 M04/M17 A3034',
  station: 'KJFK',
  time: { dt: '2026-01-19T18:51:00Z', repr: '191851Z' },
  wind_direction: { value: 310, repr: '310' },
  wind_speed: { value: 8, repr: '08KT' },
  wind_gust: null,
  visibility: { value: 16093, repr: '10' },
  clouds: [{ type: 'FEW', altitude: 250, repr: 'FEW250' }],
  flight_rules: 'VFR',
  temperature: { value: -4, repr: 'M04' },
  dewpoint: { value: -17, repr: 'M17' },
  units: { wind_speed: 'KT', visibility: 'm' },
};

describe('Weather Router', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>['weather'];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    vi.mocked(fetch).mockReset();
    
    ctx = createMockContext({
      userId: TEST_USER_ID,
      clerkId: TEST_CLERK_ID,
    });

    // Setup default userPreferences mock
    ctx.db.userPreferences.findUnique.mockResolvedValue({
      id: 'pref-1',
      userId: TEST_USER_ID,
      favoriteAirport: 'KJFK',
      theme: 'SYSTEM',
      unitSystem: 'METRIC',
      currency: 'USD',
      defaultAircraftId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    ctx.db.userPreferences.upsert.mockImplementation(async ({ create, update }) => ({
      id: 'pref-1',
      userId: TEST_USER_ID,
      theme: 'SYSTEM',
      unitSystem: 'METRIC',
      currency: 'USD',
      defaultAircraftId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...create,
      ...update,
    }));

    caller = createTestCaller(ctx).weather;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getMetar', () => {
    it('should return mock METAR when AVWX_API_KEY not set', async () => {
      // Since AVWX_API_KEY is not set in test env, router returns mock data
      const result = await caller.getMetar({ icao: 'KJFK' });

      expect(result.icao).toBe('KJFK');
      expect(result.station).toContain('Mock Data');
      expect(result.flightCategory).toBe('VFR');
      expect(result.wind.direction).toBe(310);
      expect(result.wind.speed).toBe(8);
      // Fetch should not be called when API key missing
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should use cached METAR on second call within TTL', async () => {
      // First call - generates mock and caches it
      const result1 = await caller.getMetar({ icao: 'KJFK' });
      expect(result1.icao).toBe('KJFK');

      // Second call - should use cache (console output will show "Using cached METAR")
      const result2 = await caller.getMetar({ icao: 'KJFK' });
      expect(result2.icao).toBe('KJFK');
      expect(result2.raw).toBe(result1.raw); // Same cached data
    });

    it('should fallback to mock METAR when AVWX API fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'API Error',
      } as Response);

      const result = await caller.getMetar({ icao: 'KJFK' });

      expect(result.icao).toBe('KJFK');
      expect(result.station).toContain('Mock Data');
      expect(result.flightCategory).toBe('VFR');
    });

    it('should fallback to mock METAR when AVWX API key missing', async () => {
      // Mock will return null when no API key, triggering fallback
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid API key',
      } as Response);

      const result = await caller.getMetar({ icao: 'KLAX' });

      expect(result.icao).toBe('KLAX');
      expect(result.station).toContain('Mock Data');
    });

    it('should convert ICAO to uppercase in mock data', async () => {
      const result = await caller.getMetar({ icao: 'egll' });

      expect(result.icao).toBe('EGLL'); // Converted to uppercase
      expect(result.station).toContain('EGLL');
    });
  });

  describe('getFavoriteAirportMetar', () => {
    it('should fetch METAR for user favorite airport', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetarResponse,
      } as Response);

      const result = await caller.getFavoriteAirportMetar();

      expect(result.icao).toBe('KJFK');
      expect(ctx.db.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID },
      });
    });

    it('should default to KJFK when user has no favorite airport set', async () => {
      ctx.db.userPreferences.findUnique.mockResolvedValueOnce({
        id: 'pref-1',
        userId: TEST_USER_ID,
        favoriteAirport: null,
        theme: 'SYSTEM',
        unitSystem: 'METRIC',
        currency: 'USD',
        defaultAircraftId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetarResponse,
      } as Response);

      const result = await caller.getFavoriteAirportMetar();

      expect(result.icao).toBe('KJFK'); // Default
    });

    it('should fallback to mock data on error', async () => {
      ctx.db.userPreferences.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const result = await caller.getFavoriteAirportMetar();

      expect(result.icao).toBe('KJFK');
      expect(result.station).toContain('Mock Data');
    });
  });

  describe('setFavoriteAirport', () => {
    it('should update user favorite airport', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockMetarResponse, station: 'KLAX' }),
      } as Response);

      const result = await caller.setFavoriteAirport({ icao: 'KLAX' });

      expect(ctx.db.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID },
        update: { favoriteAirport: 'KLAX' },
        create: expect.objectContaining({
          userId: TEST_USER_ID,
          favoriteAirport: 'KLAX',
        }),
      });
      expect(result.favoriteAirport).toBe('KLAX');
    });

    it('should allow setting airport even when AVWX verification fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Airport not found',
      } as Response);

      const result = await caller.setFavoriteAirport({ icao: 'ZZZZ' });

      expect(ctx.db.userPreferences.upsert).toHaveBeenCalled();
      expect(result.favoriteAirport).toBe('ZZZZ');
    });

    it('should convert ICAO to uppercase before saving', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetarResponse,
      } as Response);

      await caller.setFavoriteAirport({ icao: 'klax' });

      expect(ctx.db.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID },
        update: { favoriteAirport: 'KLAX' },
        create: expect.objectContaining({
          favoriteAirport: 'KLAX',
        }),
      });
    });
  });
});
