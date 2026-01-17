import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema, createFlightSchema, updateFlightSchema } from '@/src/lib/shared-schemas';
import { createAuditLog } from '@/lib/audit-logger';

export const flightRouter = createTRPCRouter({
  // Get all flights for the current user with optional filters
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        flightType: z.enum(['PIC', 'DUAL', 'SOLO']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        return [];
      }

      type DateFilter = { gte?: Date; lte?: Date };
      type FlightFilters = {
        userId: string;
        OR?: Array<Record<string, unknown>>;
        date?: DateFilter;
        flightType?: string;
        picTime?: { gt?: number; equals?: number };
        dualTime?: { gt?: number; equals?: number };
        [key: string]: unknown;
      };

      const filters: FlightFilters = {
        userId: ctx.user.id,
      };

      if (input.search) {
        filters.OR = [
          { departureCode: { contains: input.search, mode: 'insensitive' } },
          { arrivalCode: { contains: input.search, mode: 'insensitive' } },
          { remarks: { contains: input.search, mode: 'insensitive' } },
          { aircraft: { id: { contains: input.search, mode: 'insensitive' } } },
        ];
      }

      if (input.startDate || input.endDate) {
        const dateFilter: DateFilter = {};
        if (input.startDate) dateFilter.gte = input.startDate;
        if (input.endDate) dateFilter.lte = input.endDate;
        filters.date = dateFilter;
      }

      if (input.flightType) {
        switch (input.flightType) {
          case 'PIC':
            filters.picTime = { gt: 0 };
            break;
          case 'DUAL':
            filters.dualTime = { gt: 0 };
            break;
          case 'SOLO':
            filters.picTime = { gt: 0 };
            filters.dualTime = { equals: 0 };
            break;
        }
      }

      return ctx.db.flight.findMany({
        where: filters,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          departureCode: true,
          arrivalCode: true,
          duration: true,
          picTime: true,
          dualTime: true,
          landings: true,
          dayLandings: true,
          nightLandings: true,
          remarks: true,
          aircraftId: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          aircraft: {
            select: {
              id: true,
              make: true,
              model: true,
              registration: true,
              imageUrl: true,
              status: true,
              isArchived: true,
              createdAt: true,
              updatedAt: true,
              flightHours: true,
              userId: true,
            },
          },
        },
      });
    }),

  // Get unique aircraft for the current user (for scalable filter dropdown)
  getUserAircraft: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    return ctx.db.flight.findMany({
      where: { userId: ctx.user.id },
      distinct: ['aircraftId'],
      select: {
        aircraftId: true,
        aircraft: { select: { id: true, model: true, registration: true } },
      },
    });
  }),

  // Get a single flight by ID (standardized as 'get')
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        return null;
      }
      const flight = await ctx.db.flight.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        select: {
          id: true,
          date: true,
          departureCode: true,
          arrivalCode: true,
          duration: true,
          picTime: true,
          dualTime: true,
          landings: true,
          dayLandings: true,
          nightLandings: true,
          remarks: true,
          aircraftId: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          aircraft: {
            select: {
              id: true,
              make: true,
              model: true,
              registration: true,
              imageUrl: true,
              status: true,
              isArchived: true,
              createdAt: true,
              updatedAt: true,
              flightHours: true,
              userId: true,
            },
          },
        },
      });
      return flight;
    }),

  // Create a new flight
  create: protectedProcedure
    .input(createFlightSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      // Verify aircraft belongs to user
      const aircraft = await ctx.db.aircraft.findFirst({
        where: {
          id: input.aircraftId,
          userId: ctx.user.id,
        },
      });

      if (!aircraft) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Aircraft not found' });
      }

      const flight = await ctx.db.flight.create({
        data: {
          date: input.date,
          departureCode: input.departureCode,
          arrivalCode: input.arrivalCode,
          duration: input.duration,
          picTime: input.picTime,
          dualTime: input.dualTime,
          dayLandings: input.dayLandings,
          nightLandings: input.nightLandings,
          remarks: input.remarks,
          aircraftId: input.aircraftId,
          userId: ctx.user.id,
          landings: input.dayLandings + input.nightLandings, // for backward compatibility
        },
        include: {
          aircraft: true,
        },
      });

      // Audit log: Flight creation
      await createAuditLog({
        userId: ctx.user.id,
        action: 'CREATE',
        entityType: 'Flight',
        entityId: flight.id,
        newValues: {
          date: flight.date,
          departureCode: flight.departureCode,
          arrivalCode: flight.arrivalCode,
          duration: flight.duration,
          aircraftId: flight.aircraftId,
        },
        changes: `Created flight: ${flight.departureCode} → ${flight.arrivalCode} (${flight.duration}h)`,
      });

      return flight;
    }),

  // Update a flight
  update: protectedProcedure
    .input(updateFlightSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      
      const { id, ...data } = input;

      // Fetch old values for audit trail
      const oldFlight = await ctx.db.flight.findUnique({
        where: { id },
      });

      if (!oldFlight || oldFlight.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Flight not found or unauthorized',
        });
      }

      // Use update instead of updateMany for better error handling
      const flight = await ctx.db.flight.update({
        where: {
          id,
          userId: ctx.user.id, // Security Check!
        },
        data,
      });

      // Log audit event
      await createAuditLog({
        userId: ctx.user.id,
        action: 'UPDATE',
        entityType: 'flight',
        entityId: id,
        oldValues: oldFlight,
        newValues: flight,
        changes: `Updated flight: ${Object.keys(data).join(', ')}`,
      });

      return flight;
    }),

  // Delete a flight
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      // Fetch flight before deletion for audit trail
      const flightToDelete = await ctx.db.flight.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          date: true,
          departureCode: true,
          arrivalCode: true,
          duration: true,
          userId: true,
        },
      });

      if (!flightToDelete || flightToDelete.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Flight not found or unauthorized',
        });
      }
      
      // Delete the flight
      const flight = await ctx.db.flight.delete({
        where: {
          id: input.id,
          userId: ctx.user.id, // Security Check!
        },
      });

      // Audit log: Flight deletion
      await createAuditLog({
        userId: ctx.user.id,
        action: 'DELETE',
        entityType: 'Flight',
        entityId: input.id,
        oldValues: {
          date: flightToDelete.date,
          departureCode: flightToDelete.departureCode,
          arrivalCode: flightToDelete.arrivalCode,
          duration: flightToDelete.duration,
        },
        changes: `Deleted flight: ${flightToDelete.departureCode} → ${flightToDelete.arrivalCode}`,
      });

      return flight;
    }),

  // Get recent flights (last 10) for the current user
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        return [];
      }

      const limit = input?.limit ?? 10;

      return ctx.db.flight.findMany({
        where: { userId: ctx.user.id },
        orderBy: { date: 'desc' },
        take: limit,
        include: { aircraft: true },
      });
    }),

  // Get flight statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Return zero stats if user not in database yet
    if (!ctx.user) {
      return {
        totalFlights: 0,
        totalHours: 0,
        totalPicHours: 0,
        totalDualHours: 0,
        totalLandings: 0,
        recency: {
          last90DaysFlights: 0,
          last90DaysLandings: 0,
          isCurrent: false,
        },
      };
    }

    // All-time stats
    const flights = await ctx.db.flight.findMany({
      where: { userId: ctx.user.id },
    });
    const totalFlights = flights.length;
    const totalHours = flights.reduce((sum, f) => sum + (f.duration ?? 0), 0);
    const totalPicHours = flights.reduce((sum, f) => sum + (f.picTime ?? 0), 0);
    const totalDualHours = flights.reduce((sum, f) => sum + (f.dualTime ?? 0), 0);
    // Sum both dayLandings and nightLandings for totalLandings
    const totalLandings = flights.reduce((sum, f) => sum + ((f.dayLandings ?? 0) + (f.nightLandings ?? 0)), 0);

    // 90-day recency stats
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const recentFlights = await ctx.db.flight.findMany({
      where: {
        userId: ctx.user.id,
        date: { gte: ninetyDaysAgo },
      },
    });
    const last90DaysFlights = recentFlights.length;
    const last90DaysLandings = recentFlights.reduce((sum, f) => sum + ((f.dayLandings ?? 0) + (f.nightLandings ?? 0)), 0);
    const isCurrent = last90DaysLandings >= 3;

    return {
      totalFlights,
      totalHours,
      totalPicHours,
      totalDualHours,
      totalLandings,
      recency: {
        last90DaysFlights,
        last90DaysLandings,
        isCurrent,
      },
    };
  }),
});
