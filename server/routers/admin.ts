import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
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
      // TODO: Add audit logging for role changes (security compliance)
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.verified ? "PILOT" : "USER" },
      });
    }),

  // 5. Update User Role (Dual-Write: DB + Clerk)
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(["ADMIN", "USER", "PILOT"]), // Match your Prisma Schema Enums
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Update Database (Source of Truth)
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId }, // Ensure 'id' is the correct DB lookup field
        data: { role: input.role },
      });

      if (!updatedUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found in DB" });
      }
      // FIXME: No rollback if Clerk update fails after DB update (consider transaction or compensating action)
      // 2. Update Clerk Metadata (Clerk v6 async client)
      // Note: If your DB 'id' is NOT the 'clerkId', swap this to use 'updatedUser.clerkId'
      const client = await clerkClient();
      await client.users.updateUserMetadata(updatedUser.clerkId, {
        publicMetadata: {
          role: input.role,
        },
      });

      return updatedUser;
    }),

  // 6. Delete User
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from deleting themselves
      if (ctx.user.id === input.userId) {
        throw new Error("Cannot delete your own account");
      }

      // TODO: Add soft-delete and audit trail for user deletions
      // Delete user and cascade delete their related data (flights, aircraft)
      return ctx.db.user.delete({
        where: { id: input.userId },
      });
    }),
});