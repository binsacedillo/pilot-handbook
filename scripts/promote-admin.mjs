#!/usr/bin/env node

/**
 * Script to promote current user to admin via Clerk Backend SDK
 * 
 * Usage:
 * node scripts/promote-admin.mjs YOUR_CLERK_USER_ID
 * 
 * The Clerk User ID can be found in Clerk Dashboard → Users → Your user's profile page
 */

import 'dotenv/config';

const userId = process.argv[2];

if (!userId) {
  console.error("❌ Please provide a Clerk user ID");
  console.error("\nUsage: node scripts/promote-admin.mjs user_xxxxx");
  console.error("\nFind your Clerk User ID at: https://dashboard.clerk.com/users");
  process.exit(1);
}

async function main() {
  try {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY not found in .env.local");
    }

    console.log(`\n🔄 Promoting user ${userId} to ADMIN...\n`);

    // Use Clerk's REST API directly
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          role: 'ADMIN',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Clerk API error: ${response.statusText}`);
    }

    const user = await response.json();

    console.log('✅ Successfully promoted user to ADMIN!');
    console.log(`\nUser ID: ${user.id}`);
    console.log(`Role: ${user.public_metadata?.role || 'N/A'}\n`);
    console.log('⚠️  Note: User may need to sign out and sign back in for changes to take effect.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
