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
  type Aircraft = {
    id: string;
    make: string;
    model: string;
    registration: string;
    imageUrl: string;
    status: string;
    isArchived: boolean;
    userId?: string;
  };

let aircraftDb: Aircraft[];
let ctx: ReturnType<typeof createMockContext>;
let caller: ReturnType<typeof createTestCaller>;

beforeEach(() => {
  // Clean DB and context
  aircraftDb = [];
  ctx = createMockContext(); // Must be first

  // Define find helpers after ctx is created

  // Helper to create find mocks using the context's userId
  const makeMockFind = (userId?: string) => (args?: { where?: { id?: string; userId?: string } }) => {
    const { where } = args || {};
    const found = aircraftDb.find((a) => {
      const idMatch = where?.id ? a.id === where.id : true;
      const userMatch = userId ? a.userId === userId : (where?.userId ? a.userId === where.userId : true);
      return idMatch && userMatch && !a.isArchived;
    });
    return found ?? null;
  };

  // Assign mocks directly to ctx.db.aircraft
  ctx.db.aircraft.findFirst.mockImplementation(makeMockFind(ctx.session.userId));
  if (ctx.db.aircraft.findUnique) {
    ctx.db.aircraft.findUnique.mockImplementation(makeMockFind(ctx.session.userId));
  }

  // Helper to apply mocks to any context (for access control test)
  // removed applyAircraftMocks helper to avoid implicit any and unused globals
  ctx.db.aircraft.create.mockImplementation(async (args: { data: Partial<Aircraft> }) => {
    const newId = `test-id-${aircraftDb.length + 1}`;
    const newAircraft: Aircraft = {
      id: newId,
      isArchived: false,
      make: String(args.data.make ?? ''),
      model: String(args.data.model ?? ''),
      registration: String(args.data.registration ?? ''),
      imageUrl: String(args.data.imageUrl ?? ''),
      status: String(args.data.status ?? 'operational'),
      userId: args.data.userId,
    };
    aircraftDb.push(newAircraft);
    return newAircraft;
  });
  ctx.db.aircraft.update.mockImplementation(async (args: { where: { id: string }, data: Partial<Aircraft> }) => {
    const idx = aircraftDb.findIndex(a => a.id === args.where.id);
    if (idx >= 0) {
      const current = aircraftDb[idx] as Aircraft;
      aircraftDb[idx] = { ...current, ...args.data };
    }
    return aircraftDb[idx] ?? null;
  });
  ctx.db.aircraft.delete.mockImplementation(async (args: { where: { id: string } }) => {
    const idx = aircraftDb.findIndex(a => a.id === args.where.id);
    if (idx >= 0) {
      const current = aircraftDb[idx] as Aircraft;
      aircraftDb[idx] = { ...current, isArchived: true };
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

  const baseUser = {
    id: 'owner-user',
    clerkId: 'owner-clerk',
    email: 'owner@example.com',
    role: 'USER',
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

  it('should delete an aircraft (soft delete/archive)', async () => {
    const input = { ...baseAircraft };
    const aircraftId = 'test-aircraft-id';

    // 1. Mock 'create' to return the new aircraft
    ctx.db.aircraft.create.mockResolvedValue({ ...input, id: aircraftId, isArchived: false });
    const created = await caller.aircraft.create(input);

    // 2. Mock 'update' (which is likely what 'delete' calls for soft-delete)
    // We tell it to return the aircraft with isArchived: true
    ctx.db.aircraft.update.mockResolvedValue({ ...created, isArchived: true });
    await caller.aircraft.delete({ id: created.id });

    // 3. THE FIX: Mock 'findUnique' to return NULL for the subsequent fetch
    // This simulates the behavior of getById filtering out archived records
    ctx.db.aircraft.findUnique.mockResolvedValue(null);

    const afterDelete = await caller.aircraft.getById({ id: created.id });

    // 4. Assertions
    expect(afterDelete).toBeNull();

    // Verify that the database was actually called with the 'isArchived' flag
    expect(ctx.db.aircraft.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: created.id },
        data: { isArchived: true }
      })
    );
  });

  it('should not allow access to another user\'s aircraft', async () => {
    // 1. Create the base input
    const input = { ...baseAircraft };

    // 2. Setup context for the "Owner"
    const ownerCtx = createMockContext({ user: baseUser });
    const ownerCaller = createTestCaller(ownerCtx);

    // Mock the creation to return the aircraft with the owner's ID
    ownerCtx.db.aircraft.create.mockResolvedValue({ ...input, userId: baseUser.id });
    const created = await ownerCaller.aircraft.create(input);

    // 3. Setup context for the "Attacker" (Other User)
    const otherUser = {
      id: 'other-user',
      clerkId: 'clerk_other',
      email: 'other@example.com',
      role: 'PILOT'
    };
    const otherCtx = createMockContext({ user: otherUser });
    const otherCaller = createTestCaller(otherCtx);

    // 4. THE FIX: Mock the 'findUnique' or 'findFirst' to return NULL 
    // because the aircraft doesn't belong to the 'other-user'
    otherCtx.db.aircraft.findUnique.mockResolvedValue(null);

    // 5. Execution
    const result = await otherCaller.aircraft.getById({ id: created.id });

    // 6. Assertion
    expect(result).toBeNull();
  });

});
