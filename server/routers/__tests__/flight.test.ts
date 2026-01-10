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
      landings: 1,
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
      landings: 1.5, // Invalid
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
      landings: 1,
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
    ctx.db.flight.create.mockImplementation(async (input) => {
      const newFlight: Flight = {
        id: 'test-flight-1',
        aircraftId: input.aircraftId,
        departureCode: input.departureCode,
        arrivalCode: input.arrivalCode,
        date: input.date,
        duration: input.duration,
        picTime: input.picTime,
        dualTime: input.dualTime,
        landings: input.landings,
        remarks: input.remarks,
      };
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
      landings: 1,
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
      landings: 1,
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
      landings: 1,
      remarks: 'Test flight',
    };
    const created = await caller.flight.create(input);
    await caller.flight.delete({ id: created.id });
    const afterDelete = await caller.flight.get({ id: created.id });
    expect(afterDelete).toBeNull();
  });
});