import { describe, it, expect, beforeEach } from 'vitest';
import { createTestCaller, createMockContext } from './test-utils';

// Aircraft type for stateful mock
interface Aircraft {
  id: string;
  userId: string;
  make: string;
  model: string;
  registration: string;
  imageUrl?: string;
  status?: string;
  [key: string]: unknown;
}

// Removed unused mockAircrafts variable
let aircraftDb: Aircraft[] = [];

let ctx: ReturnType<typeof createMockContext>;
let caller: ReturnType<typeof createTestCaller>;

beforeEach(() => {
  ctx = createMockContext();
  aircraftDb = [];

  // Diagnostics: Check if mocks are active
  console.log('isMock(create):', vi.isMockFunction(ctx.db.aircraft.create));
  console.log('isMock(update):', vi.isMockFunction(ctx.db.aircraft.update));
  console.log('isMock(findFirst):', vi.isMockFunction(ctx.db.aircraft.findFirst));

  // Create
  ctx.db.aircraft.create.mockImplementation(async (input) => {
    const newAircraft: Aircraft = {
      id: 'test-aircraft-1',
      userId: ctx.user.id,
      ...input.data,
    };
    aircraftDb.push(newAircraft);
    return newAircraft;
  });

  // Get (findFirst)
  ctx.db.aircraft.findFirst.mockImplementation(async (args) => {
    if (args && args.where && args.where.id) {
      return aircraftDb.find(a => a.id === args.where.id && a.userId === args.where.userId) || null;
    }
    return null;
  });

  // Update
  ctx.db.aircraft.update.mockImplementation(async (args) => {
    const idx = aircraftDb.findIndex(a => a.id === args.where.id && a.userId === args.where.userId);
    if (idx === -1) throw new Error('Not found');
    aircraftDb[idx] = { ...aircraftDb[idx], ...args.data };
    return aircraftDb[idx];
  });

  // Delete
  ctx.db.aircraft.delete.mockImplementation(async (args) => {
    const idx = aircraftDb.findIndex(a => a.id === args.where.id && a.userId === args.where.userId);
    if (idx === -1) throw new Error('Not found');
    const [deleted] = aircraftDb.splice(idx, 1);
    return deleted;
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
    const result = await caller.aircraft.get({ id: created.id });
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
    const afterDelete = await caller.aircraft.get({ id: created.id });
    expect(afterDelete).toBeNull();
  });

  it('should not allow access to another user\'s aircraft', async () => {
    const input = { ...baseAircraft };
    const created = await caller.aircraft.create(input);
    // Simulate a different user context
    const otherCtx = createMockContext({ user: { id: 'other-user', email: 'other@example.com' } });
    const otherCaller = createTestCaller(otherCtx);
    const result = await otherCaller.aircraft.get({ id: created.id });
    expect(result).toBeNull();
  });
});
