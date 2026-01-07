import { describe, test, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../../server/routers/_app";
import { db } from "../../lib/db";

// --- Mock Data ---
type MockAircraft = {
  id: string;
  make: string;
  model: string;
  registration: string;
  imageUrl: string | null;
  status: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  flightHours: number;
  userId: string;
};
let aircraftDb: MockAircraft[];

const baseAircraft = {
	id: "aircraft-1",
	make: "Cessna",
	model: "172",
	registration: "N12345",
	imageUrl: null,
	status: "operational",
	isArchived: false,
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-01-01T00:00:00Z"),
	flightHours: 0,
	userId: "test-user-id",
};

const archivedAircraft = {
	...baseAircraft,
	id: "aircraft-2",
	make: "Piper",
	model: "PA-28",
	registration: "N54321",
	isArchived: true,
	createdAt: new Date("2025-01-02T00:00:00Z"),
	updatedAt: new Date("2025-01-02T00:00:00Z"),
};

// --- Prisma Mock ---
vi.mock("../../lib/db", () => {
	// Mock user and aircraft models
	const user = {
		findUnique: vi.fn(async () => {
			// Always return a fake user for tests
			return {
				id: "test-user-id",
				clerkId: "test-clerk-id",
				email: "test@example.com",
				firstName: "Test",
				lastName: "User",
				license: "PPL",
				licenseExpiry: new Date("2030-01-01T00:00:00Z"),
				role: "USER",
				createdAt: new Date("2025-01-01T00:00:00Z"),
				updatedAt: new Date("2025-01-01T00:00:00Z"),
			};
		}),
	};
	const aircraft = {
		create: vi.fn(async ({ data }) => {
			const newAircraft = {
				...data,
				id: `aircraft-${aircraftDb.length + 1}`,
				isArchived: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				flightHours: 0,
				userId: "test-user-id",
				imageUrl: null,
			};
			aircraftDb.push(newAircraft);
			return newAircraft;
		}),
		update: vi.fn(async ({ where, data }) => {
			const idx = aircraftDb.findIndex((a) => a.id === where.id);
			if (idx === -1) return null;
			aircraftDb[idx] = { ...aircraftDb[idx], ...data, updatedAt: new Date() };
			return aircraftDb[idx];
		}),
		findUnique: vi.fn(async ({ where }) => {
			const found = aircraftDb.find((a) => a.id === where.id) || null;
			return found
				? {
						...found,
						createdAt: found.createdAt || new Date(),
						updatedAt: found.updatedAt || new Date(),
						flightHours: 0,
						userId: "test-user-id",
						imageUrl: null,
				  }
				: null;
		}),
		findFirst: vi.fn(async ({ where }) => {
			const found = aircraftDb.find((a) => a.id === where.id) || null;
			return found
				? {
						...found,
						createdAt: found.createdAt || new Date(),
						updatedAt: found.updatedAt || new Date(),
						flightHours: 0,
						userId: "test-user-id",
						imageUrl: null,
				  }
				: null;
		}),
		findMany: vi.fn(async (args) => {
			let result = aircraftDb;
			if (args?.where?.isArchived === true)
				result = aircraftDb.filter((a) => a.isArchived);
			if (args?.where?.isArchived === false)
				result = aircraftDb.filter((a) => !a.isArchived);
			return result.map((a) => ({
				...a,
				createdAt: a.createdAt || new Date(),
				updatedAt: a.updatedAt || new Date(),
				flightHours: 0,
				userId: "test-user-id",
				imageUrl: null,
			}));
		}),
	};
	return {
		db: {
			user,
			aircraft,
		},
	};
});

// --- Test Suite ---

describe("Aircraft Router (Direct Caller)", () => {
	let caller: ReturnType<typeof appRouter.createCaller>;

	beforeEach(() => {
		aircraftDb = [{ ...baseAircraft }, { ...archivedAircraft }];
		caller = appRouter.createCaller({
			db: db,
			session: { userId: "test-clerk-id" },
			headers: new Headers(),
		});
		// Ensure user.findUnique always returns a fake user for protectedProcedure
		vi.mocked(db.user.findUnique).mockResolvedValue({
			id: "test-user-id",
			clerkId: "test-clerk-id",
			email: "test@example.com",
			firstName: "Test",
			lastName: "User",
			license: "PPL",
			licenseExpiry: new Date("2030-01-01T00:00:00Z"),
			role: "USER",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		});
		// Ensure aircraft.findFirst returns a valid aircraft for getById
		vi.mocked(db.aircraft.findFirst).mockResolvedValue(
			baseAircraft as never as Awaited<ReturnType<typeof db.aircraft.findFirst>>
		);
	});

	describe("Create Aircraft", () => {
		test("should create a new aircraft", async () => {
			const input = {
				make: "Diamond",
				model: "DA40",
				registration: "N123DA",
				imageUrl: "",
				status: "operational",
			};
			const result = await caller.aircraft.create(input);
			expect(result).toMatchObject({
				make: "Diamond",
				model: "DA40",
				registration: "N123DA",
				isArchived: false,
				status: "operational",
			});
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Update Aircraft", () => {
		test("should update aircraft details", async () => {
			const input = {
				id: "aircraft-1",
				make: "Cessna",
				model: "172 Updated",
				registration: "N172UPD",
				imageUrl: "",
				status: "operational",
			};
			const result = await caller.aircraft.update(input);
			expect(result.make).toBe("Cessna");
			expect(result.model).toBe("172 Updated");
			expect(result.registration).toBe("N172UPD");
			expect(result.id).toBe("aircraft-1");
		});
	});

	describe("Get Aircraft", () => {
		test("should get aircraft by id", async () => {
			const result = await caller.aircraft.getById({ id: "aircraft-1" });
			expect(result).toMatchObject({
				id: "aircraft-1",
				make: "Cessna",
				model: "172",
				isArchived: false,
			});
		});
	});

	describe("Delete Aircraft", () => {
		test("should set isArchived to true", async () => {
			const result = await caller.aircraft.delete({ id: "aircraft-1" });
			expect(result.isArchived).toBe(true);
			expect(aircraftDb.find((a) => a.id === "aircraft-1")?.isArchived).toBe(
				true
			);
		});
	});

	describe("Restore Aircraft", () => {
		test("should set isArchived to false", async () => {
			const result = await caller.aircraft.restore({ id: "aircraft-2" });
			expect(result.isArchived).toBe(false);
			expect(aircraftDb.find((a) => a.id === "aircraft-2")?.isArchived).toBe(
				false
			);
		});
	});

	describe("Get All Aircraft", () => {
		test("should hide archived aircraft by default", async () => {
			const result = await caller.aircraft.getAll({});
			expect(result).toEqual([expect.objectContaining({ isArchived: false })]);
			expect(result.some((a) => a.isArchived)).toBe(false);
		});

		test("should show archived aircraft when filtered", async () => {
			// Ensure the mock returns at least one archived aircraft
			vi.mocked(db.aircraft.findMany).mockResolvedValue([
				{
					id: "aircraft-2",
					make: "Piper",
					model: "PA-28",
					registration: "N54321",
					imageUrl: null,
					status: "operational",
					isArchived: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					flightHours: 0,
					userId: "test-user-id",
				},
			]);
			const result = await caller.aircraft.getAll({ includeArchived: true });
			expect(result).toEqual([expect.objectContaining({ isArchived: true })]);
		});
	});
});
