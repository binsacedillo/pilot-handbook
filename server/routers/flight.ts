import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema, createFlightSchema, updateFlightSchema } from '@/src/lib/shared-schemas';

export const flightRouter = createTRPCRouter({
  // Get all flights for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Ensure user exists in database first
    if (!ctx.user) {
      return [];
    }
    
    const flights = await ctx.db.flight.findMany({
      where: { userId: ctx.user.id },
      include: {
        aircraft: true,
      },
      orderBy: { date: 'desc' },
    });
    return flights;
  }),

  // Get a single flight by ID
  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        return null;
      }
      
      const flight = await ctx.db.flight.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          aircraft: true,
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
          ...input,
          userId: ctx.user.id,
        },
        include: {
          aircraft: true,
        },
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

      // Use update instead of updateMany for better error handling
      const flight = await ctx.db.flight.update({
        where: {
          id,
          userId: ctx.user.id, // Security Check!
        },
        data,
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
      
      // Use delete instead of deleteMany for better error handling
      const flight = await ctx.db.flight.delete({
        where: {
          id: input.id,
          userId: ctx.user.id, // Security Check!
        },
      });

      return flight;
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
      };
    }
    
    const flights = await ctx.db.flight.findMany({
      where: { userId: ctx.user.id },
    });

    const totalFlights = flights.length;
    const totalHours = flights.reduce((sum, f) => sum + f.duration, 0);
    const totalPicHours = flights.reduce((sum, f) => sum + f.picTime, 0);
    const totalDualHours = flights.reduce((sum, f) => sum + f.dualTime, 0);
    const totalLandings = flights.reduce((sum, f) => sum + f.landings, 0);

    return {
      totalFlights,
      totalHours,
      totalPicHours,
      totalDualHours,
      totalLandings,
    };
  }),
});
