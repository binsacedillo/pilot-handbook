/**
 * Script to sync existing admin role to Clerk public metadata
 * Run: npm run sync:admin-role
 */

import { PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

const db = new PrismaClient();

async function syncPrismaRoleToClerk(clerkUserId) {
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
        console.error(`❌ Error syncing:`, error.message);
      }
    }

    console.log("\n✅ Sync complete!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
