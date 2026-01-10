describe('Validation', () => {
  it('should fail to create if registration (tailNumber) is empty', async () => {
    const input = {
      make: 'Cessna',
      model: '172',
      registration: '', // Invalid
      imageUrl: '',
      status: 'operational',
    };
    await expect(caller.aircraft.create(input)).rejects.toThrow();
  });

  it('should fail to create if make is missing', async () => {
    const input = {
      // make: 'Cessna', // Missing
      model: '172',
      registration: 'N12345',
      imageUrl: '',
      status: 'operational',
    };
    // @ts-expect-error: make is missing
    await expect(caller.aircraft.create(input)).rejects.toThrow();
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestCaller, createMockContext } from './test-utils';


// Aircraft type for stateful mock




let aircraftDb;
let ctx;
let caller;

beforeEach(() => {
  // Clean DB and context
  aircraftDb = [];
  ctx = createMockContext(); // Must be first

  // Define mockFind after ctx is created
  // Use the context's userId for access control
  const mockFind = function (args) {
    const { where } = args || {};
    // 'this' will be bound to the db context (see below)
    const userId = this && this._userId ? this._userId : undefined;
    const found = aircraftDb.find((a) => {
      const idMatch = where?.id ? a.id === where.id : true;
      // If userId is set on the db context, enforce access control
      const userMatch = userId ? a.userId === userId : (where?.userId ? a.userId === where.userId : true);
      return idMatch && userMatch && !a.isArchived;
    });
    return found ?? null;
  };

  // Assign mocks directly to ctx.db.aircraft
  ctx.db.aircraft.findFirst.mockImplementation(mockFind.bind(ctx.db.aircraft));
  if (ctx.db.aircraft.findUnique) {
    ctx.db.aircraft.findUnique.mockImplementation(mockFind.bind(ctx.db.aircraft));
  }

  // Helper to apply mocks to any context (for access control test)
  global.applyAircraftMocks = (db) => {
    db.aircraft.findFirst.mockImplementation(mockFind.bind(db.aircraft));
    if (db.aircraft.findUnique) {
      db.aircraft.findUnique.mockImplementation(mockFind.bind(db.aircraft));
    }
    db.aircraft.create.mockImplementation(async (args) => {
      const newId = `test-id-${aircraftDb.length + 1}`;
      const newAircraft = { ...args.data, id: newId, isArchived: false };
      aircraftDb.push(newAircraft);
      return newAircraft;
    });
    db.aircraft.update.mockImplementation(async (args) => {
      const idx = aircraftDb.findIndex(a => a.id === args.where.id);
      if (idx >= 0) {
        aircraftDb[idx] = { ...aircraftDb[idx], ...args.data };
      }
      return aircraftDb[idx] ?? null;
    });
    db.aircraft.delete.mockImplementation(async (args) => {
      const idx = aircraftDb.findIndex(a => a.id === args.where.id);
      if (idx >= 0) {
        aircraftDb[idx].isArchived = true;
      }
      return aircraftDb[idx] ?? null;
    });
  };
  ctx.db.aircraft.create.mockImplementation(async (args) => {
    const newId = `test-id-${aircraftDb.length + 1}`;
    const newAircraft = { ...args.data, id: newId, isArchived: false };
    aircraftDb.push(newAircraft);
    return newAircraft;
  });
  ctx.db.aircraft.update.mockImplementation(async (args) => {
    const idx = aircraftDb.findIndex(a => a.id === args.where.id);
    if (idx >= 0) {
      aircraftDb[idx] = { ...aircraftDb[idx], ...args.data };
    }
    return aircraftDb[idx] ?? null;
  });
  ctx.db.aircraft.delete.mockImplementation(async (args) => {
    const idx = aircraftDb.findIndex(a => a.id === args.where.id);
    if (idx >= 0) {
      aircraftDb[idx].isArchived = true;
    }
    return aircraftDb[idx] ?? null;
  });
  caller = createTestCaller(ctx);
});

describe('Aircraft Router', () => {

  const baseAircraft = {
    make: 'Cessna',
    model: '172',
    registration: 'N12345',
    imageUrl: '',
    status: 'operational',
  };

  it('should create an aircraft', async () => {
    const input = { ...baseAircraft };
    const result = await caller.aircraft.create(input);
    expect(result.id).toBeDefined();
    expect(result.model).toBe('172');
    expect(result.make).toBe('Cessna');
  });

  it('should get an aircraft by id', async () => {
    const input = { ...baseAircraft };
    const created = await caller.aircraft.create(input);
    const result = await caller.aircraft.getById({ id: created.id });
    expect(result).not.toBeNull();
    expect(result!.id).toBe(created.id);
  });

  it('should update an aircraft', async () => {
    const input = { ...baseAircraft };
    const created = await caller.aircraft.create(input);
    const updated = await caller.aircraft.update({
      id: created.id,
      make: 'Cessna',
      model: '182',
      registration: 'N54321',
      imageUrl: '',
      status: 'operational',
    });
    expect(updated.model).toBe('182');
    expect(updated.registration).toBe('N54321');
    expect(updated.make).toBe('Cessna');
  });

  it('should delete an aircraft', async () => {
    const input = { ...baseAircraft };
    const created = await caller.aircraft.create(input);
    await caller.aircraft.delete({ id: created.id });
    const afterDelete = await caller.aircraft.getById({ id: created.id });
    expect(afterDelete).toBeNull(); // getById should not return archived
    // Optionally, check the underlying db for isArchived
    const archived = aircraftDb.find(a => a.id === created.id);
    expect(archived?.isArchived).toBe(true);
  });

  it('should not allow access to another user\'s aircraft', async () => {
    const input = { ...baseAircraft };
    const created = await caller.aircraft.create(input);
    // Simulate a different user context
    const otherCtx = createMockContext({ user: { id: 'other-user', email: 'other@example.com' } });
    // Attach userId to the mock db for this test caller
    otherCtx.db.aircraft._userId = otherCtx.user.id;
    // Apply the same mocks to the new context
    global.applyAircraftMocks(otherCtx.db);
    const otherCaller = createTestCaller(otherCtx);
    const result = await otherCaller.aircraft.getById({ id: created.id });

    expect(result).toBeNull();
  });

});
