import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { paginationSchema } from "@/src/lib/shared-schemas";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { currentUser } from "@clerk/nextjs/server";

export const adminRouter = createTRPCRouter({
  // Full user list with pagination/search for admin table
  getAllUsers: adminProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const whereFilter = input.search
        ? {
            OR: [
              {
                firstName: {
                  contains: input.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                lastName: {
                  contains: input.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: input.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {};

      const [users, totalCount] = await Promise.all([
        ctx.db.user.findMany({
          where: whereFilter,
          skip: input.skip,
          take: input.take,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.user.count({ where: whereFilter }),
      ]);

      return { users, totalCount };
    }),

  // 1. Get Dashboard Stats - with double verification
  getStats: adminProcedure.query(async ({ ctx }) => {
    // Security Check: Double verify they are admin via Clerk
    const clerkUser = await currentUser();
    const role = clerkUser?.publicMetadata?.role as string | undefined;
    
    if (role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const [userCount, pilotCount, pendingCount] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({ where: { role: "PILOT" } }),
      ctx.db.user.count({
        where: { role: "USER", license: { not: null } },
      }), // Users with licenses uploaded
    ]);

    return { userCount, pilotCount, pendingCount };
  }),

  // 2. Approve/Reject Pilot
  verifyPilot: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        action: z.enum(["approve", "reject"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Security check via adminProcedure middleware
      const clerkUser = await currentUser();
      const role = clerkUser?.publicMetadata?.role as string | undefined;

      if (role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (input.action === "approve") {
        return ctx.db.user.update({
          where: { id: input.userId },
          data: { role: "PILOT" },
        });
      } else {
        return ctx.db.user.update({
          where: { id: input.userId },
          data: { license: null }, // Clear the rejected license
        });
      }
    }),

  // Recent users list
  recentUsers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    return users;
  }),
});

export type AdminRouter = typeof adminRouter;