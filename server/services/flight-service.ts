import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

/**
 * Service to handle complex flight statistics, legality calculations, and mission detection.
 * Separates business logic from the tRPC transport layer.
 */
export const FlightService = {
  /**
   * Aggregates flight experience and calculates pilot legality (Go/No-Go).
   */
  async getStats(db: PrismaClient, userId: string) {
    // 1. Fetch Pilot Profile & Flights (Type-silent bypass for stale client defs)
    const profile = await (db as any).pilotProfile.findUnique({
      where: { userId }
    });

    const flights: any[] = await (db as any).flight.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    // 2. Aggregate Experience Totals with explicit type annotations (Fix for TS7006)
    const totalFlights = flights.length;
    
    const totalHours = flights.reduce((sum: number, f: any) => sum + (f.duration ?? 0), 0);
    const totalPicHours = flights.reduce((sum: number, f: any) => sum + (f.picTime ?? 0), 0);
    const totalDualHours = flights.reduce((sum: number, f: any) => sum + (f.dualTime ?? 0), 0);
    
    const totalLandings = flights.reduce(
      (sum: number, f: any) => sum + ((f.dayLandings ?? 0) + (f.nightLandings ?? 0)), 
      0
    );

    // 3. Dynamic Calculation Engine Imports (Delayed for performance)
    const { calculateCurrency } = await import('@/lib/compliance-engine');
    const { calculateOverallLegality } = await import('@/lib/dashboard/currency-utils');
    
    const compliance = calculateCurrency(flights.map((f: any) => ({
      date: f.date,
      dayLandings: f.dayLandings,
      nightLandings: f.nightLandings,
      duration: f.duration
    })));

    // 4. Calculate Dashboard Legality (Go/No-Go Lamps)
    const legality = calculateOverallLegality({
      flights: flights.map((f: any) => ({
        date: f.date,
        dayLandings: f.dayLandings,
        nightLandings: f.nightLandings
      })),
      medicalExpiry: profile?.medicalExpiry ?? null,
      lastRestDate: profile?.lastRestDate ?? null,
    });

    return {
      totalFlights,
      totalHours: parseFloat(totalHours.toFixed(1)),
      totalPicHours: parseFloat(totalPicHours.toFixed(1)),
      totalDualHours: parseFloat(totalDualHours.toFixed(1)),
      totalLandings,
      compliance,
      legality,
      profile,
    };
  },

  /**
   * Detects the single next upcoming mission for a pilot.
   */
  async getUpcomingMission(db: PrismaClient, userId: string, now: string) {
    const upcoming = await (db as any).flight.findFirst({
      where: {
        userId,
        date: { gte: new Date(now) },
      },
      orderBy: { date: 'asc' },
      include: { aircraft: true },
    });

    return upcoming;
  }
};
