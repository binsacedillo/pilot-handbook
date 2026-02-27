import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
} from "../trpc";
import { createAuditLog, getAuditLogs } from "@/lib/audit-logger";

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
      const oldUser = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { role: true },
      });

      if (!oldUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const newRole = input.verified ? "PILOT" : "USER";

      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: newRole },
      });

      // Log the role change
      await createAuditLog({
        userId: ctx.user.id,
        action: "VERIFY",
        entityType: "User",
        entityId: input.userId,
        oldValues: { role: oldUser.role },
        newValues: { role: newRole },
        changes: `User verified: role changed from ${oldUser.role} to ${newRole}`,
      });

      return updatedUser;
    }),

  // 5. Update User Role (Dual-Write: DB + Clerk)
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(["ADMIN", "USER", "PILOT"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Fetch old role for audit trail
      const oldUser = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, role: true, clerkId: true },
      });

      if (!oldUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // 1. Update Database (Source of Truth)
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      // 2. Update Clerk Metadata
      const client = await clerkClient();
      await client.users.updateUserMetadata(updatedUser.clerkId, {
        publicMetadata: {
          role: input.role,
        },
      });

      // 3. Log the role change with audit trail
      await createAuditLog({
        userId: ctx.user.id,
        action: "ROLE_CHANGE",
        entityType: "User",
        entityId: input.userId,
        oldValues: { role: oldUser.role },
        newValues: { role: input.role },
        changes: `User role changed from ${oldUser.role} to ${input.role}`,
      });

      return updatedUser;
    }),

  // 6. Delete User (Soft-Delete Pattern)
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from deleting themselves
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete your own account",
        });
      }

      // Fetch user data before deletion for audit trail
      const userToDelete = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          email: true,
          clerkId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!userToDelete) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Delete user and cascade delete their flights, aircraft, and preferences
      const deletedUser = await ctx.db.user.delete({
        where: { id: input.userId },
      });

      // Log the deletion with full audit trail
      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE",
        entityType: "User",
        entityId: input.userId,
        oldValues: userToDelete,
        changes: `User deleted: ${userToDelete.email} (${userToDelete.role})`,
      });

      return deletedUser;
    }),

  // 7. Get Audit Logs (Admin only)
  getAuditLogs: adminProcedure
    .input(
      z.object({
        action: z.enum(["CREATE", "UPDATE", "DELETE", "RESTORE", "ROLE_CHANGE", "VERIFY", "UNVERIFY"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(100),
        skip: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await getAuditLogs({
        action: input.action,
        startDate: input.startDate,
        endDate: input.endDate,
        limit: Math.min(input.limit, 500), // Cap at 500 to prevent abuse
        skip: input.skip,
      });
    }),
});