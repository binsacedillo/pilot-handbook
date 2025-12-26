import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema, createAircraftSchema, updateAircraftSchema } from '@/src/lib/shared-schemas';

export const aircraftRouter = createTRPCRouter({
  // Get all aircraft for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Return empty array if user not in database yet
    if (!ctx.user) {
      return [];
    }
    
    const aircraft = await ctx.db.aircraft.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return aircraft;
  }),

  // Get a single aircraft by ID
  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        return null;
      }
      
      const aircraft = await ctx.db.aircraft.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });
      return aircraft;
    }),

  // Create a new aircraft
  create: protectedProcedure
    .input(createAircraftSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      
      const aircraft = await ctx.db.aircraft.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      });
      return aircraft;
    }),

  // Update an aircraft
  update: protectedProcedure
    .input(updateAircraftSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      
      const { id, ...data } = input;

      // Use update instead of updateMany for better error handling
      const aircraft = await ctx.db.aircraft.update({
        where: {
          id,
          userId: ctx.user.id, // Security Check!
        },
        data,
      });

      return aircraft;
    }),

  // Delete an aircraft
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      
      // Use delete instead of deleteMany for better error handling
      const aircraft = await ctx.db.aircraft.delete({
        where: {
          id: input.id,
          userId: ctx.user.id, // Security Check!
        },
      });

      return aircraft;
    }),
});
