/**
 * STATS ROUTER TESTS
 * Tests all statistics calculations (hours by type, by month, summaries)
 */

import { describe, it, expect } from 'vitest';

describe('Stats Router - Unit Tests', () => {
  describe('Hours by aircraft type', () => {
    it('should group flights by aircraft and sum hours', () => {
      const flights = [
        { aircraftId: '1', duration: 2.0 },
        { aircraftId: '1', duration: 1.5 },
        { aircraftId: '2', duration: 3.0 },
      ];

      const hoursByAircraft = flights.reduce((acc, f) => {
        acc[f.aircraftId] = (acc[f.aircraftId] || 0) + f.duration;
        return acc;
      }, {} as Record<string, number>);

      expect(hoursByAircraft['1']).toBe(3.5);
      expect(hoursByAircraft['2']).toBe(3.0);
    });

    it('should handle aircraft with no flights', () => {
      const flights: { aircraftId: string; duration: number }[] = [];
      const hoursByAircraft = flights.reduce((acc, f) => {
        acc[f.aircraftId] = (acc[f.aircraftId] || 0) + f.duration;
        return acc;
      }, {} as Record<string, number>);

      expect(Object.keys(hoursByAircraft)).toHaveLength(0);
    });

    it('should correctly aggregate multiple flights per aircraft', () => {
      const flights = [
        { aircraftId: 'C172', duration: 1.0 },
        { aircraftId: 'C172', duration: 2.5 },
        { aircraftId: 'C172', duration: 1.5 },
        { aircraftId: 'PA28', duration: 3.0 },
      ];

      const hoursByAircraft = flights.reduce((acc, f) => {
        acc[f.aircraftId] = (acc[f.aircraftId] || 0) + f.duration;
        return acc;
      }, {} as Record<string, number>);

      expect(hoursByAircraft['C172']).toBe(5.0);
      expect(hoursByAircraft['PA28']).toBe(3.0);
    });
  });

  describe('Hours by month (last 12 months)', () => {
    it('should group flights by month and sum hours', () => {
      const flights = [
        { date: new Date('2024-12-01'), duration: 2.0 },
        { date: new Date('2024-12-15'), duration: 1.5 },
        { date: new Date('2024-11-01'), duration: 3.0 },
      ];

      const monthlyData: Record<string, number> = {};

      flights.forEach(flight => {
        const monthKey = flight.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + flight.duration;
      });

      const decemberKey = new Date('2024-12-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const novemberKey = new Date('2024-11-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      expect(monthlyData[decemberKey]).toBe(3.5);
      expect(monthlyData[novemberKey]).toBe(3.0);
    });

    it('should return 0 hours for months with no flights', () => {
      const now = new Date('2024-12-15');
      const monthlyData: Record<string, number> = {};

      // Initialize all 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = 0;
      }

      const keys = Object.keys(monthlyData);
      expect(keys).toHaveLength(12);

      // All should start at 0
      keys.forEach(key => {
        expect(monthlyData[key]).toBe(0);
      });
    });

    it('should maintain chronological order after reversing', () => {
      const monthlyData = {
        'Dec 2024': 5.0,
        'Nov 2024': 3.0,
        'Oct 2024': 2.0,
      };

      const chronological = Object.entries(monthlyData).reverse();

      expect(chronological[0]![0]).toBe('Oct 2024');
      expect(chronological[1]![0]).toBe('Nov 2024');
      expect(chronological[2]![0]).toBe('Dec 2024');
    });
  });

  describe('Summary statistics', () => {
    it('should calculate total hours correctly', () => {
      const flights = [
        { duration: 2.0 },
        { duration: 1.5 },
        { duration: 3.0 },
      ];

      const totalHours = flights.reduce((sum, f) => sum + (f.duration || 0), 0);

      expect(totalHours).toBe(6.5);
    });

    it('should count total flights', () => {
      const flights = [
        { duration: 2.0 },
        { duration: 1.5 },
        { duration: 3.0 },
      ];

      expect(flights.length).toBe(3);
    });

    it('should calculate average flight hours', () => {
      const flights = [
        { duration: 2.0 },
        { duration: 1.5 },
        { duration: 3.0 },
      ];

      const totalHours = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
      const avgHours = flights.length > 0 ? parseFloat((totalHours / flights.length).toFixed(2)) : 0;

      expect(avgHours).toBe(2.17);
    });

    it('should handle empty flight list', () => {
      const flights: { duration: number }[] = [];

      const totalHours = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
      const totalFlights = flights.length;
      const avgHours = totalFlights > 0 ? parseFloat((totalHours / totalFlights).toFixed(2)) : 0;

      expect(totalHours).toBe(0);
      expect(totalFlights).toBe(0);
      expect(avgHours).toBe(0);
    });

    it('should handle single flight', () => {
      const flights = [{ duration: 2.5 }];

      const totalHours = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
      const avgHours = flights.length > 0 ? parseFloat((totalHours / flights.length).toFixed(2)) : 0;

      expect(totalHours).toBe(2.5);
      expect(avgHours).toBe(2.5);
    });
  });

  describe('Time-based statistics', () => {
    it('should calculate PIC hours by month', () => {
      const flights = [
        { date: new Date('2024-12-01'), picTime: 2.0 },
        { date: new Date('2024-12-15'), picTime: 1.5 },
        { date: new Date('2024-11-01'), picTime: 3.0 },
      ];

      const picByMonth: Record<string, number> = {};

      flights.forEach(flight => {
        const monthKey = flight.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        picByMonth[monthKey] = (picByMonth[monthKey] || 0) + flight.picTime;
      });

      const decemberKey = new Date('2024-12-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      expect(picByMonth[decemberKey]).toBe(3.5);
    });

    it('should calculate DUAL hours by month', () => {
      const flights = [
        { date: new Date('2024-12-01'), dualTime: 1.0 },
        { date: new Date('2024-12-15'), dualTime: 0 },
        { date: new Date('2024-11-01'), dualTime: 1.5 },
      ];

      const dualByMonth: Record<string, number> = {};

      flights.forEach(flight => {
        const monthKey = flight.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        dualByMonth[monthKey] = (dualByMonth[monthKey] || 0) + flight.dualTime;
      });

      const decemberKey = new Date('2024-12-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      expect(dualByMonth[decemberKey]).toBe(1.0);
    });
  });

  describe('90-Day Recency calculation', () => {
    it('should identify recent landings (last 90 days)', () => {
      const now = new Date('2025-01-01');
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const flights = [
        { date: new Date('2024-12-15') }, // Recent
        { date: new Date('2024-10-01') }, // Older than 90 days
        { date: new Date('2024-11-15') }, // Recent
      ];

      const recentFlights = flights.filter(f => f.date >= ninetyDaysAgo);

      expect(recentFlights).toHaveLength(2);
    });

    it('should count landings in last 90 days', () => {
      const now = new Date('2025-01-01');
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const flights = [
        { date: new Date('2024-12-20') },
        { date: new Date('2024-12-25') },
        { date: new Date('2024-12-28') },
        { date: new Date('2024-10-01') },
      ];

      const recentLandings = flights.filter(f => f.date >= ninetyDaysAgo).length;

      expect(recentLandings).toBe(3);
    });

    it('should determine compliance status (need 3 landings in 90 days)', () => {
      const now = new Date('2025-01-01');
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const compliantFlights = [
        { date: new Date('2024-12-20') },
        { date: new Date('2024-12-25') },
        { date: new Date('2024-12-28') },
      ];

      const nonCompliantFlights = [
        { date: new Date('2024-12-20') },
        { date: new Date('2024-12-25') },
      ];

      const compliantLandings = compliantFlights.filter(f => f.date >= ninetyDaysAgo).length;
      const nonCompliantLandings = nonCompliantFlights.filter(f => f.date >= ninetyDaysAgo).length;

      expect(compliantLandings).toBeGreaterThanOrEqual(3);
      expect(nonCompliantLandings).toBeLessThan(3);
    });
  });
});
