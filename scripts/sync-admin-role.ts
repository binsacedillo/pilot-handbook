import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { clerkClient } from "@clerk/nextjs/server";

// Create Prisma client with proper adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

/**
 * Script to sync existing admin role to Clerk public metadata
 * Run: npx tsx ./scripts/sync-admin-role.ts
 */
async function syncPrismaRoleToClerk(clerkUserId: string): Promise<void> {
  // Get the user's role from database
  const user = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { role: true },
  });

  if (!user) {
    throw new Error(`User not found: ${clerkUserId}`);
  }

  // Sync role to Clerk's public metadata
  const client = await clerkClient();
  await client.users.updateUser(clerkUserId, {
    publicMetadata: { role: user.role },
  });
}

async function main() {
  try {
    // Find all admin users
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { clerkId: true, email: true },
    });

    if (admins.length === 0) {
      console.log("No admin users found in database");
      return;
    }

    console.log(`Found ${admins.length} admin user(s):`);

    for (const admin of admins) {
      console.log(`\nSyncing ${admin.email} (${admin.clerkId})...`);
      try {
        await syncPrismaRoleToClerk(admin.clerkId);
        console.log(`✅ Successfully synced`);
      } catch (error) {
        console.error(`❌ Error syncing:`, error);
      }
    }

    console.log("\n✅ Sync complete!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
