import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema } from '@/src/lib/shared-schemas';

export const flightRouter = createTRPCRouter({
  // Get all flights for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const flights = await ctx.db.flight.findMany({
      where: { userId: ctx.userId },
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
      const flight = await ctx.db.flight.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        include: {
          aircraft: true,
        },
      });
      return flight;
    }),

  // Create a new flight
  create: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        departureCode: z.string().min(3).max(4),
        arrivalCode: z.string().min(3).max(4),
        duration: z.number().positive(),
        picTime: z.number().min(0),
        dualTime: z.number().min(0),
        landings: z.number().int().positive().default(1),
        remarks: z.string().optional(),
        aircraftId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify aircraft belongs to user
      const aircraft = await ctx.db.aircraft.findFirst({
        where: {
          id: input.aircraftId,
          userId: ctx.userId,
        },
      });

      if (!aircraft) {
        throw new Error('Aircraft not found');
      }

      const flight = await ctx.db.flight.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
        include: {
          aircraft: true,
        },
      });

      return flight;
    }),

  // Update a flight
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date().optional(),
        departureCode: z.string().min(3).max(4).optional(),
        arrivalCode: z.string().min(3).max(4).optional(),
        duration: z.number().positive().optional(),
        picTime: z.number().min(0).optional(),
        dualTime: z.number().min(0).optional(),
        landings: z.number().int().positive().optional(),
        remarks: z.string().optional(),
        aircraftId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const flight = await ctx.db.flight.updateMany({
        where: {
          id,
          userId: ctx.userId,
        },
        data,
      });

      return flight;
    }),

  // Delete a flight
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const flight = await ctx.db.flight.deleteMany({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      return flight;
    }),

  // Get flight statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const flights = await ctx.db.flight.findMany({
      where: { userId: ctx.userId },
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
