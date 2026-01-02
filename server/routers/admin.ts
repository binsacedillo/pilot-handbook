import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "../trpc";

// Define schema for pagination if you use it, or remove this input if not needed
const paginationSchema = z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
});

export const adminRouter = createTRPCRouter({
  // 1. Get System Stats
  getStats: adminProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.db.user.count();
    const totalFlights = await ctx.db.flight.count();
    const totalAircraft = await ctx.db.aircraft.count();

    return {
      totalUsers,
      totalFlights,
      totalAircraft,
    };
  }),

  // 2. Get Recent Users
  recentUsers: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
  }),

  // 3. Get All Users (Table)
  getAllUsers: adminProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const skip = input?.skip || 0;
      const take = input?.take || 10;

      const users = await ctx.db.user.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      });

      const total = await ctx.db.user.count();

      return { users, total };
    }),

  // 4. Verify Pilot
  verifyPilot: adminProcedure
    .input(z.object({ userId: z.string(), verified: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Logic to update user verification
      // If you don't have a 'verified' field, you might be using roles
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.verified ? "PILOT" : "USER" },
      });
    }),

  // 5. Delete User
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from deleting themselves
      if (ctx.user.id === input.userId) {
        throw new Error("Cannot delete your own account");
      }

      // Delete user and cascade delete their related data (flights, aircraft)
      return ctx.db.user.delete({
        where: { id: input.userId },
      });
    }),
});