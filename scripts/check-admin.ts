import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create Prisma client with proper adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("\n🔍 Checking Admin Users in Database...\n");
    
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { clerkId: true, email: true, role: true },
    });

    if (admins.length === 0) {
      console.log("❌ No admin users found in database\n");
      console.log("💡 Run this to make yourself admin:");
      console.log("   UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';\n");
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`);
      admins.forEach((admin) => {
        console.log(`   Email: ${admin.email}`);
        console.log(`   Clerk ID: ${admin.clerkId}`);
        console.log(`   Role: ${admin.role}\n`);
      });
      
      console.log("📝 Next Steps:");
      console.log("   1. Go to: https://dashboard.clerk.com");
      console.log("   2. Navigate to: Users → Click your user");
      console.log("   3. Edit 'Public metadata' and add:");
      console.log(`      { "role": "ADMIN" }`);
      console.log("   4. Save and refresh your app\n");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

main().catch(async (error) => {
  console.error("Fatal error:", error);
  await db.$disconnect();
  await pool.end();
  process.exit(1);
});
