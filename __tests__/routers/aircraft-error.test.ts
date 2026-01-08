import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createCaller } from '../../server/routers/_app';
import { db } from '../../lib/db';

dateMock();

function dateMock() {
  const now = new Date('2026-01-08T12:00:00.000Z');
  vi.useFakeTimers();
  vi.setSystemTime(now);
}

vi.mock('../../lib/db');

interface Aircraft {
  id: string;
  registration: string;
  make: string;
  model: string;
  userId: string;
  flightHours: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const baseAircraft: Aircraft = {
  id: 'aircraft-1',
  registration: 'N12345',
  make: 'Cessna',
  model: '172',
  userId: 'user-1',
  flightHours: 1200,
  isArchived: false,
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-01T10:00:00.000Z'),
};

let aircraftDb: Aircraft[] = [];

beforeEach(() => {
  aircraftDb = [ { ...baseAircraft } ];
  (db.aircraft as unknown as {
    create: (data: { data: Partial<Aircraft> }) => Promise<Aircraft>;
    update: (args: { where: { id: string }, data: Partial<Aircraft> }) => Promise<Aircraft | null>;
    findFirst: (args: { where: { id: string } }) => Promise<Aircraft | null>;
    findMany: (args?: { where?: { isArchived?: boolean } }) => Promise<Aircraft[]>;
  }) = {
    create: vi.fn(async (data) => {
      if (!data.data.registration) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing registration' });
      }
      const newAircraft: Aircraft = {
        ...baseAircraft,
        ...data.data,
        id: 'aircraft-' + (aircraftDb.length + 1),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      aircraftDb.push(newAircraft);
      return newAircraft;
    }),
    update: vi.fn(async (args) => {
      const idx = aircraftDb.findIndex((a: Aircraft) => a.id === args.where.id);
      if (idx === -1) throw new TRPCError({ code: 'NOT_FOUND', message: 'Aircraft not found' });
      if (aircraftDb[idx]!.userId !== 'user-1') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authorized' });
      }
      aircraftDb[idx] = { ...aircraftDb[idx]!, ...args.data, updatedAt: new Date() };
      return aircraftDb[idx] ?? null;
    }),
    findFirst: vi.fn(async (args) => {
      return aircraftDb.find((a: Aircraft) => a.id === args.where.id) || null;
    }),
    findMany: vi.fn(async () => {
      return aircraftDb;
    }),
  };
});

describe('Aircraft Error Handling', () => {
  function getCaller(sessionId = 'user-1') {
    return createCaller({ db, session: { userId: sessionId }, headers: new Headers() });
  }

  test('Validation: create throws if registration missing', async () => {
    const caller = getCaller();
    // registration is required, so omit it to trigger error
    await expect(caller.aircraft.create({ make: 'Cessna', model: '172', registration: '' })).rejects.toThrow(TRPCError);
  });

  test('Security: update throws UNAUTHORIZED if userId mismatch', async () => {
    const caller = getCaller('user-2');
    await expect(caller.aircraft.update({ id: baseAircraft.id, make: 'Piper' })).rejects.toThrow(TRPCError);
  });

  test('Existence: getById returns null if not found', async () => {
    const caller = getCaller();
    const result = await caller.aircraft.getById({ id: 'nonexistent-id' });
    expect(result).toBeNull();
  });

  test('Not Found: delete throws if aircraft ID does not exist', async () => {
    const caller = getCaller();
    (db.aircraft.update as unknown as (args: { where: { id: string }, data: Partial<Aircraft> }) => Promise<Aircraft | null>) = vi.fn(async () => { throw new TRPCError({ code: 'NOT_FOUND', message: 'Aircraft not found' }); });
    await expect(caller.aircraft.delete({ id: 'bad-id' })).rejects.toThrow(TRPCError);
  });

  test('Empty State: getAll returns [] if db is empty', async () => {
    aircraftDb = [];
    const caller = getCaller();
    const result = await caller.aircraft.getAll();
    expect(result).toEqual([]);
  });
});
