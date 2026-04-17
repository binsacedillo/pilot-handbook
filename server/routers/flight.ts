import { TRPCError } from '@trpc/server';
import { Flight } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema, createFlightSchema, updateFlightSchema } from '@/lib/shared-schemas';
import { createAuditLog } from '@/lib/audit-logger';
import { FlightService } from '../services/flight-service';
import { CommandService } from '../services/command-service';
import { 
  createFlightCommandSchema, 
  updateFlightCommandSchema, 
  deleteFlightCommandSchema 
} from '@/lib/shared-schemas';

export const flightRouter = createTRPCRouter({
  // Get all flights for the current user with optional filters
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        flightType: z.enum(['PIC', 'DUAL', 'SOLO']).optional(),
        aircraftId: z.string().optional(),
        isVerified: z.boolean().optional(),
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
      
      if (input.aircraftId) {
        filters.aircraftId = input.aircraftId;
      }
      
      if (input.isVerified !== undefined) {
        filters.isVerified = input.isVerified;
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
          isVerified: true,
          instructorName: true,
          signatureData: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          version: true,
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
          isVerified: true,
          instructorName: true,
          signatureData: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          version: true,
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

  create: protectedProcedure
    .input(createFlightCommandSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
      }

      return CommandService.createFlight(ctx.db, ctx.user.id, input) as Promise<Flight>;
    }),

  // Update a flight (Refactored to Command Pattern)
  update: protectedProcedure
    .input(updateFlightCommandSchema) // Now expects the specific update command
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
      }

      return CommandService.updateFlight(ctx.db, ctx.user.id, input) as Promise<Flight>;
    }),

  // Delete a flight (Refactored to Command Pattern)
  delete: protectedProcedure
    .input(deleteFlightCommandSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
      }

      return CommandService.deleteFlight(ctx.db, ctx.user.id, input) as Promise<{ success: boolean }>;
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

  // Get flight statistics with enhanced compliance logic (Delegated to Service)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return {
        totalFlights: 0,
        totalHours: 0,
        totalPicHours: 0,
        totalDualHours: 0,
        totalLandings: 0,
        compliance: null,
        legality: null,
        profile: null,
      };
    }

    return FlightService.getStats(ctx.db as any, ctx.user.id);
  }),

  // Get the single next upcoming flight (Delegated to Service)
  getUpcoming: protectedProcedure
    .input(z.object({ now: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return null;
      return FlightService.getUpcomingFlight(ctx.db as any, ctx.user.id, input.now);
    }),
});
