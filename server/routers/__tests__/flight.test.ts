  it('should allow a flight with zero dayLandings and nightLandings', async () => {
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: 1.0,
      picTime: 1.0,
      dualTime: 0,
      dayLandings: 0,
      nightLandings: 0,
      remarks: 'No landings (scenic tour)',
    };
    const result = await caller.flight.create(input);
    expect(result.id).toBeDefined();
    expect(result.dayLandings).toBe(0);
    expect(result.nightLandings).toBe(0);
  });
  
  it('should sum decimal durations accurately (float precision)', async () => {
    // Reset DB for this test
    flightDb.length = 0;
    await caller.flight.create({
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: 2.0,
      picTime: 2.0,
      dualTime: 0,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Leg 1',
    });
    await caller.flight.create({
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-02'),
      duration: 2.0,
      picTime: 2.0,
      dualTime: 0,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Leg 2',
    });
    const total = flightDb.reduce((sum, f) => sum + (typeof f.duration === 'number' ? f.duration : 0), 0);
    expect(total).toBe(4.0);
  });

  it('should accept a massive flight duration (14.5h)', async () => {
    // Reset DB for this test
    flightDb.length = 0;
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'CDG',
      date: new Date('2026-01-01'),
      duration: 14.5,
      picTime: 14.5,
      dualTime: 0,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'International ferry',
    };
    const result = await caller.flight.create(input);
    expect(result.duration).toBe(14.5);
    // Simulate analytics aggregation
    const total = flightDb.reduce((sum, f) => sum + (typeof f.duration === 'number' ? f.duration : 0), 0);
    expect(total).toBeGreaterThanOrEqual(14.5);
  });

  it('should reject if picTime exceeds duration', async () => {
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: 3.0,
      picTime: 5.0, // Invalid
      dualTime: 0,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Invalid PIC time',
    };
    await expect(caller.flight.create(input)).rejects.toThrow();
  });
describe('Validation', () => {
  it('should fail to create if duration is negative', async () => {
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: -10, // Invalid
      picTime: 0,
      dualTime: 0,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Negative duration',
    };
    await expect(caller.flight.create(input)).rejects.toThrow();
  });

  it('should fail to create if landings is a decimal', async () => {
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: 100,
      picTime: 0,
      dualTime: 0,
      dayLandings: 1.5, // Invalid
      nightLandings: 0,
      remarks: 'Decimal landings',
    };
    await expect(caller.flight.create(input)).rejects.toThrow();
  });

  it('should fail to create if date is in the future', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: futureDate, // Invalid (future)
      duration: 100,
      picTime: 0,
      dualTime: 0,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Future date',
    };
    // If your schema does not yet validate future dates, this test will fail until you add it
    await expect(caller.flight.create(input)).rejects.toThrow();
  });
});

type Flight = {
  id: string;
  aircraftId: string;
  departureCode: string;
  arrivalCode: string;
  date: Date;
  duration: number;
  picTime: number;
  dualTime: number;
  landings: number;
  remarks: string;
};

// Stateful mock array for flights
let flightDb: Flight[] = [];
// Helper to generate unique IDs for test flights

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestCaller, createMockContext } from './test-utils';


let ctx: ReturnType<typeof createMockContext>;
let caller: ReturnType<typeof createTestCaller>;

beforeEach(() => {
  ctx = createMockContext();
  // Mock aircraft existence for the test user
  ctx.db.aircraft.findFirst.mockResolvedValue({
    id: 'aircraft-1',
    userId: 'pilot-1',
    // Add other required aircraft fields if needed
  });
    flightDb = [];
    // Stateful flight.create
    ctx.db.flight.create.mockImplementation(async (args) => {
      const data = args && args.input ? args.input : args?.data ?? args;
      console.log('Create input duration:', data?.duration);
      const baseFlight = {
        id: 'test-flight-' + Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'test-user-id',
        dayLandings: 0,
        nightLandings: 0,
        duration: 0,
        aircraft: {
          id: 'test-aircraft',
          registration: 'RP-C1234',
          make: 'Cessna',
          model: '172',
          imageUrl: '',
          status: 'Active',
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          flightHours: 100,
          userId: 'test-user-id',
        },
      };
      const now = new Date();
      const newFlight = {
        ...baseFlight,
        id: 'test-flight-' + Date.now(),
        createdAt: now,
        updatedAt: now,
        ...data,
        duration: Number(data?.duration ?? baseFlight.duration ?? 0),
      };
      console.log('Saved duration:', newFlight.duration);
      flightDb.push(newFlight);
      return newFlight;
    });
  // Mock flight.findFirst to return the same flight object for GET
    // Stateful flight.findFirst (get)
    ctx.db.flight.findFirst.mockImplementation(async (args) => {
      if (args && args.where && args.where.id) {
        return flightDb.find(f => f.id === args.where.id) || null;
      }
      return null;
    });
  // Mock flight.findUnique for delete pre-check
    ctx.db.flight.findUnique.mockImplementation(async (args) => {
      if (args && args.where && args.where.id) {
        return flightDb.find(f => f.id === args.where.id) || null;
      }
      return null;
    });
  // Mock flight.delete to return the deleted flight object
    // Stateful flight.delete
    ctx.db.flight.delete.mockImplementation(async (args) => {
      const idx = flightDb.findIndex(f => f.id === args.where.id);
      if (idx === -1) throw new Error('Not found');
      const [deleted] = flightDb.splice(idx, 1);
      return deleted;
    });
  caller = createTestCaller(ctx);
});


describe('Flight Router', () => {
  it('should create a flight', async () => {
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: 300,
      picTime: 100,
      dualTime: 200,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Test flight',
    };
    const result = await caller.flight.create(input);
    expect(result.id).toBeDefined();
  });

  it('should get a flight by id', async () => {
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: 300,
      picTime: 100,
      dualTime: 200,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Test flight',
    };
    const created = await caller.flight.create(input);
    const result = await caller.flight.get({ id: created.id });
    expect(result).not.toBeNull();
  });

  it('should delete a flight', async () => {
    const input = {
      aircraftId: 'aircraft-1',
      departureCode: 'JFK',
      arrivalCode: 'LAX',
      date: new Date('2026-01-01'),
      duration: 300,
      picTime: 100,
      dualTime: 200,
      dayLandings: 1,
      nightLandings: 0,
      remarks: 'Test flight',
    };
    const created = await caller.flight.create(input);
    await caller.flight.delete({ id: created.id });
    const afterDelete = await caller.flight.get({ id: created.id });
    expect(afterDelete).toBeNull();
  });
});