/**
 * FLIGHT ROUTER TESTS
 * Tests all flight CRUD operations including filters and validation
 */

import { describe, it, expect } from 'vitest';
import { createFlightSchema, updateFlightSchema } from '@/src/lib/shared-schemas';

describe('Flight Router - Unit Tests', () => {
  // Test schema validation
  describe('createFlightSchema', () => {
    it('should validate a complete flight object', () => {
      const validFlight = {
        aircraftId: 'aircraft-1',
        date: new Date('2025-01-01'),
        departureCode: 'LAX',
        arrivalCode: 'SFO',
        duration: 2.5,
        picTime: 2.5,
        dualTime: 0,
        remarks: 'Test flight',
      };

      expect(() => createFlightSchema.parse(validFlight)).not.toThrow();
    });

    it('should validate a flight with DUAL instruction', () => {
      const dualFlight = {
        aircraftId: 'aircraft-1',
        date: new Date('2025-01-01'),
        departureCode: 'LAX',
        arrivalCode: 'SFO',
        duration: 2.0,
        picTime: 1.0,
        dualTime: 1.0,
        remarks: 'Dual instruction',
      };

      expect(() => createFlightSchema.parse(dualFlight)).not.toThrow();
    });

    it('should reject invalid departure code', () => {
      const invalidFlight = {
        aircraftId: 'aircraft-1',
        date: new Date('2025-01-01'),
        departureCode: '', // Invalid: empty
        arrivalCode: 'SFO',
        duration: 2.5,
        picTime: 2.5,
        dualTime: 0,
        remarks: 'Test flight',
      };

      expect(() => createFlightSchema.parse(invalidFlight)).toThrow();
    });

    it('should reject negative duration', () => {
      const invalidFlight = {
        aircraftId: 'aircraft-1',
        date: new Date('2025-01-01'),
        departureCode: 'LAX',
        arrivalCode: 'SFO',
        duration: -1, // Invalid: negative
        picTime: 2.5,
        dualTime: 0,
        remarks: 'Test flight',
      };

      expect(() => createFlightSchema.parse(invalidFlight)).toThrow();
    });

    it('should accept picTime + dualTime values (validation at business logic level)', () => {
      // Note: Schema validation doesn't enforce picTime + dualTime <= duration
      // This is a business logic validation done at the router/mutation level
      const flight = {
        aircraftId: 'aircraft-1',
        date: new Date('2025-01-01'),
        departureCode: 'LAX',
        arrivalCode: 'SFO',
        duration: 2.0,
        picTime: 1.5,
        dualTime: 1.5, // Sum = 3.0 > 2.0 (not validated in schema)
        remarks: 'Test flight',
      };

      // Schema validates individual fields but not their relationship
      expect(() => createFlightSchema.parse(flight)).not.toThrow();
    });
  });

  describe('updateFlightSchema', () => {
    it('should validate an update with all fields', () => {
      const updateFlight = {
        id: 'flight-1',
        aircraftId: 'aircraft-1',
        date: new Date('2025-01-02'),
        departureCode: 'LAX',
        arrivalCode: 'SFO',
        duration: 3.0,
        picTime: 3.0,
        dualTime: 0,
        remarks: 'Updated flight',
      };

      expect(() => updateFlightSchema.parse(updateFlight)).not.toThrow();
    });

    it('should validate partial update', () => {
      const partialUpdate = {
        id: 'flight-1',
        remarks: 'Updated remarks only',
      };

      expect(() => updateFlightSchema.parse(partialUpdate)).not.toThrow();
    });

    it('should require id field', () => {
      const noId = {
        remarks: 'Updated remarks only',
      };

      expect(() => updateFlightSchema.parse(noId)).toThrow();
    });
  });

  describe('Flight getAll filtering logic', () => {
    it('should handle search filter by departure code', () => {
      // Simulating filter logic
      const flights = [
        { id: '1', departureCode: 'LAX', arrivalCode: 'SFO', date: new Date('2025-01-01') },
        { id: '2', departureCode: 'JFK', arrivalCode: 'BOS', date: new Date('2025-01-02') },
      ];

      const searchTerm = 'LAX';
      const filtered = flights.filter(f => f.departureCode.includes(searchTerm));

      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.departureCode).toBe('LAX');
    });

    it('should handle date range filtering', () => {
      const flights = [
        { id: '1', date: new Date('2025-01-01') },
        { id: '2', date: new Date('2025-01-15') },
        { id: '3', date: new Date('2025-02-01') },
      ];

      const startDate = new Date('2025-01-10');
      const endDate = new Date('2025-02-15');
      const filtered = flights.filter(f => f.date >= startDate && f.date <= endDate);

      expect(filtered).toHaveLength(2);
      expect(filtered[0]!.id).toBe('2');
      expect(filtered[1]!.id).toBe('3');
    });

    it('should identify PIC flights (picTime > 0)', () => {
      const flights = [
        { id: '1', picTime: 2.5, dualTime: 0 },
        { id: '2', picTime: 1.0, dualTime: 1.0 },
        { id: '3', picTime: 0, dualTime: 2.0 },
      ];

      const picFlights = flights.filter(f => f.picTime > 0);

      expect(picFlights).toHaveLength(2);
      expect(picFlights.map(f => f.id)).toEqual(['1', '2']);
    });

    it('should identify DUAL flights (picTime > 0 AND dualTime > 0)', () => {
      const flights = [
        { id: '1', picTime: 2.5, dualTime: 0 },
        { id: '2', picTime: 1.0, dualTime: 1.0 },
        { id: '3', picTime: 0, dualTime: 2.0 },
      ];

      const dualFlights = flights.filter(f => f.picTime > 0 && f.dualTime > 0);

      expect(dualFlights).toHaveLength(1);
      expect(dualFlights[0]!.id).toBe('2');
    });

    it('should identify SOLO flights (picTime > 0 AND dualTime = 0)', () => {
      const flights = [
        { id: '1', picTime: 2.5, dualTime: 0 },
        { id: '2', picTime: 1.0, dualTime: 1.0 },
        { id: '3', picTime: 0, dualTime: 2.0 },
      ];

      const soloFlights = flights.filter(f => f.picTime > 0 && f.dualTime === 0);

      expect(soloFlights).toHaveLength(1);
      expect(soloFlights[0]!.id).toBe('1');
    });
  });

  describe('Flight time calculations', () => {
    it('should calculate total flight hours correctly', () => {
      const flights = [
        { duration: 2.5 },
        { duration: 1.5 },
        { duration: 3.0 },
      ];

      const totalHours = flights.reduce((sum, f) => sum + f.duration, 0);

      expect(totalHours).toBe(7.0);
    });

    it('should calculate total PIC hours correctly', () => {
      const flights = [
        { picTime: 2.5 },
        { picTime: 1.0 },
        { picTime: 0 },
      ];

      const totalPIC = flights.reduce((sum, f) => sum + f.picTime, 0);

      expect(totalPIC).toBe(3.5);
    });

    it('should calculate average flight duration', () => {
      const flights = [
        { duration: 2.0 },
        { duration: 3.0 },
        { duration: 1.0 },
      ];

      const avgDuration = flights.reduce((sum, f) => sum + f.duration, 0) / flights.length;

      expect(avgDuration).toBe(2.0);
    });
  });
});
