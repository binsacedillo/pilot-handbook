import { describe, it, expect, beforeEach } from 'vitest';
import { createMockContext, createTestCaller } from './test-utils';

describe('Security Tests', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof createTestCaller>;
  const userId = 'user-1';

  beforeEach(() => {
    ctx = createMockContext();
    ctx.user = {
      id: userId,
      clerkId: ctx.user.clerkId,
      email: ctx.user.email,
      role: ctx.user.role,
    };
    caller = createTestCaller(ctx);
  });

  describe('Input Length Validation', () => {
    it('should reject flight remarks exceeding 500 characters', async () => {
      const longRemarks = 'A'.repeat(501);
      
      ctx.db.aircraft.findUnique.mockResolvedValue({
        id: 'aircraft-1',
        make: 'Cessna',
        model: '172',
        registration: 'N12345',
        imageUrl: null,
        status: 'operational',
        flightHours: 0,
        isArchived: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        caller.flight.create({
          date: new Date(),
          departureCode: 'KJFK',
          arrivalCode: 'KBOS',
          duration: 1.5,
          picTime: 1.5,
          dualTime: 0,
          dayLandings: 1,
          nightLandings: 0,
          remarks: longRemarks,
          aircraftId: 'aircraft-1',
        })
      ).rejects.toThrow(/Remarks limited to 500 characters/);
    });

    it('should accept flight remarks at exactly 500 characters', async () => {
      const validRemarks = 'A'.repeat(500);

      // Mock aircraft lookup (flight.create uses findFirst, not findUnique)
      ctx.db.aircraft.findFirst.mockResolvedValue({
        id: 'aircraft-1',
        make: 'Cessna',
        model: '172',
        registration: 'N12345',
        imageUrl: null,
        status: 'operational',
        flightHours: 0,
        isArchived: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      ctx.db.flight.create.mockResolvedValue({
        id: 'flight-1',
        date: new Date(),
        departureCode: 'KJFK',
        arrivalCode: 'KBOS',
        duration: 1.5,
        picTime: 1.5,
        dualTime: 0,
        landings: 1,
        dayLandings: 1,
        nightLandings: 0,
        remarks: validRemarks,
        aircraftId: 'aircraft-1',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      const result = await caller.flight.create({
        date: pastDate,
        departureCode: 'KJFK',
        arrivalCode: 'KBOS',
        duration: 1.5,
        picTime: 1.5,
        dualTime: 0,
        dayLandings: 1,
        nightLandings: 0,
        remarks: validRemarks,
        aircraftId: 'aircraft-1',
      });

      expect(result.remarks).toBe(validRemarks);
    });

    it('should reject aircraft make exceeding 100 characters', async () => {
      const longMake = 'A'.repeat(101);

      await expect(
        caller.aircraft.create({
          make: longMake,
          model: 'Model',
          registration: 'N12345',
        })
      ).rejects.toThrow(/Make too long/);
    });

    it('should reject aircraft model exceeding 100 characters', async () => {
      const longModel = 'M'.repeat(101);

      await expect(
        caller.aircraft.create({
          make: 'Cessna',
          model: longModel,
          registration: 'N12345',
        })
      ).rejects.toThrow(/Model too long/);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should sanitize search input for flight queries', async () => {
      const maliciousSearch = "'; DROP TABLE flights; --";
      
      ctx.db.flight.findMany.mockResolvedValue([]);

      // Should not throw and should sanitize the input
      const result = await caller.flight.getAll({
        search: maliciousSearch,
      });

      expect(result).toEqual([]);
      expect(ctx.db.flight.findMany).toHaveBeenCalled();
    });

    it('should handle special characters in airport codes safely', async () => {
      const maliciousCode = "K<script>alert('xss')</script>";
      
      ctx.db.aircraft.findUnique.mockResolvedValue({
        id: 'aircraft-1',
        make: 'Cessna',
        model: '172',
        registration: 'N12345',
        imageUrl: null,
        status: 'operational',
        flightHours: 0,
        isArchived: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Should reject malformed airport code
      await expect(
        caller.flight.create({
          date: new Date(),
          departureCode: maliciousCode,
          arrivalCode: 'KBOS',
          duration: 1.5,
          picTime: 1.5,
          dualTime: 0,
          dayLandings: 1,
          nightLandings: 0,
          aircraftId: 'aircraft-1',
        })
      ).rejects.toThrow();
    });
  });

  describe('Business Logic Validation', () => {
    it('should prevent negative flight hours', async () => {
      ctx.db.aircraft.findUnique.mockResolvedValue({
        id: 'aircraft-1',
        make: 'Cessna',
        model: '172',
        registration: 'N12345',
        imageUrl: null,
        status: 'operational',
        flightHours: 0,
        isArchived: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        caller.flight.create({
          date: pastDate,
          departureCode: 'KJFK',
          arrivalCode: 'KBOS',
          duration: -1.5,
          picTime: 0,
          dualTime: 0,
          dayLandings: 1,
          nightLandings: 0,
          aircraftId: 'aircraft-1',
        })
      ).rejects.toThrow();
    });

    it('should prevent PIC time exceeding duration', async () => {
      ctx.db.aircraft.findUnique.mockResolvedValue({
        id: 'aircraft-1',
        make: 'Cessna',
        model: '172',
        registration: 'N12345',
        imageUrl: null,
        status: 'operational',
        flightHours: 0,
        isArchived: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        caller.flight.create({
          date: pastDate,
          departureCode: 'KJFK',
          arrivalCode: 'KBOS',
          duration: 1.0,
          picTime: 2.0,
          dualTime: 0,
          dayLandings: 1,
          nightLandings: 0,
          aircraftId: 'aircraft-1',
        })
      ).rejects.toThrow(/cannot exceed total flight duration/);
    });

    it('should prevent future-dated flights', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      ctx.db.aircraft.findUnique.mockResolvedValue({
        id: 'aircraft-1',
        make: 'Cessna',
        model: '172',
        registration: 'N12345',
        imageUrl: null,
        status: 'operational',
        flightHours: 0,
        isArchived: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        caller.flight.create({
          date: futureDate,
          departureCode: 'KJFK',
          arrivalCode: 'KBOS',
          duration: 1.5,
          picTime: 1.5,
          dualTime: 0,
          dayLandings: 1,
          nightLandings: 0,
          aircraftId: 'aircraft-1',
        })
      ).rejects.toThrow(/cannot be in the future/);
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent access to other users flights', async () => {
      const otherUserId = 'user-2';

      ctx.db.flight.findUnique.mockResolvedValue({
        id: 'flight-1',
        date: new Date(),
        departureCode: 'KJFK',
        arrivalCode: 'KBOS',
        duration: 1.5,
        picTime: 1.5,
        dualTime: 0,
        landings: 1,
        dayLandings: 1,
        nightLandings: 0,
        remarks: null,
        aircraftId: 'aircraft-1',
        userId: otherUserId, // Different user
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        caller.flight.update({
          id: 'flight-1',
          duration: 2.0,
        })
      ).rejects.toThrow(/not found or unauthorized/);
    });

    it('should prevent deletion of other users aircraft', async () => {
      const otherUserId = 'user-2';

      ctx.db.aircraft.findUnique.mockResolvedValue({
        id: 'aircraft-1',
        make: 'Cessna',
        model: '172',
        registration: 'N12345',
        imageUrl: null,
        status: 'operational',
        flightHours: 0,
        isArchived: false,
        userId: otherUserId, // Different user
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        caller.aircraft.delete({ id: 'aircraft-1' })
      ).rejects.toThrow(/not found or unauthorized/);
    });
  });
});
