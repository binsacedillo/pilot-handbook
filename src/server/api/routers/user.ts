import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { clerkClient } from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  // ...existing procedures...

  // 👇 ADD THIS "CLAIM ADMIN" FUNCTION
  claimAdmin: protectedProcedure
    .input(z.object({ secretKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Hardcoded Secret for Dev (Change this!)
      const DEV_SECRET = "make-me-admin-now";

      if (input.secretKey !== DEV_SECRET) {
        throw new Error("Wrong secret key!");
      }

      const userId = ctx.session.user;

      // 2. Update Clerk Metadata (Fixes Frontend UI)
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "ADMIN",
        },
      });

      // 3. Update Database (Fixes Backend Logic)
      await ctx.db.user.update({
        where: { clerkId: userId },
        data: { role: "ADMIN" },
      });

      return { success: true };
    }),
});
