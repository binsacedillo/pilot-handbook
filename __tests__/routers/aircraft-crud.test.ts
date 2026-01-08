import { describe, test, expect, vi, beforeEach } from 'vitest';
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

let aircraftDb: Aircraft[] = [];

beforeEach(() => {
  aircraftDb = [ { ...baseAircraft } ];
  (db.aircraft as unknown as {
    create: (data: { data: Omit<Aircraft, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'> }) => Promise<Aircraft>;
    update: (args: { where: { id: string }, data: Partial<Aircraft> }) => Promise<Aircraft | null>;
    findFirst: (args: { where: { id: string } }) => Promise<Aircraft | null>;
    findMany: (args?: { where?: { isArchived?: boolean } }) => Promise<Aircraft[]>;
  }) = {
    create: vi.fn(async (data) => {
      const newAircraft: Aircraft = {
        ...data.data,
        id: 'aircraft-' + (aircraftDb.length + 1),
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      aircraftDb.push(newAircraft);
      return newAircraft;
    }),
    update: vi.fn(async (args) => {
      const idx = aircraftDb.findIndex((a: Aircraft) => a.id === args.where.id);
      if (idx === -1) return null;
      aircraftDb[idx] = { ...aircraftDb[idx], ...args.data, updatedAt: new Date() };
      return aircraftDb[idx] ?? null;
    }),
    findFirst: vi.fn(async (args) => {
      return aircraftDb.find((a: Aircraft) => a.id === args.where.id) || null;
    }),
    findMany: vi.fn(async (args) => {
      if (!args?.where) return aircraftDb;
      if (typeof args.where.isArchived === 'boolean') {
        return aircraftDb.filter((a: Aircraft) => a.isArchived === args.where.isArchived);
      }
      return aircraftDb;
    }),
  };
});

describe('Aircraft CRUD', () => {
  function getCaller() {
    return createCaller({ db, session: { userId: 'user-1' }, headers: new Headers() });
  }

  test('Create aircraft', async () => {
    const caller = getCaller();
    const input = {
      registration: 'N54321',
      make: 'Piper',
      model: 'PA-28',
    };
    const result = await caller.aircraft.create(input);
    expect(result.registration).toBe(input.registration);
    expect(result.make).toBe(input.make);
    expect(result.model).toBe(input.model);
    // userId is not part of returned object, skip assertion
    expect(result.isArchived).toBe(false);
  });

  test('Update aircraft', async () => {
    const caller = getCaller();
    const updateInput = {
      id: baseAircraft.id,
      registration: 'N99999',
      make: 'Diamond',
      model: 'DA40',
      flightHours: 1300,
    };
    const result = await caller.aircraft.update(updateInput);
    expect(result.registration).toBe('N99999');
    expect(result.make).toBe('Diamond');
    expect(result.model).toBe('DA40');
    expect(result.flightHours).toBe(1300);
  });

  test('Get aircraft by ID', async () => {
    const caller = getCaller();
    const result = await caller.aircraft.getById({ id: baseAircraft.id });
    expect(result).not.toBeNull();
    expect(result!.id).toBe(baseAircraft.id);
  });

  test('Delete/Archive aircraft', async () => {
    const caller = getCaller();
    const result = await caller.aircraft.delete({ id: baseAircraft.id });
    expect(result.isArchived).toBe(true);
    const archived = await caller.aircraft.getById({ id: baseAircraft.id });
    expect(archived!.isArchived).toBe(true);
  });

  test('Restore aircraft', async () => {
    const caller = getCaller();
    await caller.aircraft.delete({ id: baseAircraft.id });
    const result = await caller.aircraft.restore({ id: baseAircraft.id });
    expect(result.isArchived).toBe(false);
    const restored = await caller.aircraft.getById({ id: baseAircraft.id });
    expect(restored!.isArchived).toBe(false);
  });

  test('Get All - filter archived vs active', async () => {
    const caller = getCaller();
    await caller.aircraft.delete({ id: baseAircraft.id });
    await caller.aircraft.create({ registration: 'N22222', make: 'Beechcraft', model: 'Bonanza' });
    const active = await caller.aircraft.getAll();
    expect(active.every(a => a.isArchived === false)).toBe(true);
    const archived = await caller.aircraft.getAll({ includeArchived: true });
    expect(archived.filter(a => a.isArchived).length).toBeGreaterThan(0);
  });
});

const baseAircraft = {
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
