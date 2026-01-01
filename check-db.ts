import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🏥 Starting Database Health Check...');
  console.log('-----------------------------------');

  // import db only after env is loaded
  const { db } = await import('./lib/db');

  try {
    const userCount = await db.user.count();
    console.log(`✅ Connection SUCCESS! Found ${userCount} users.`);

    const flightCount = await db.flight.count();
    console.log(`✈️  Found ${flightCount} flights in the database.`);

    console.log('-----------------------------------');
    console.log('🎉 Database is LINKED and ACTIVE.');
  } catch (error) {
    console.error('❌ CONNECTION FAILED');
    console.error(error);
  } finally {
    await db.$disconnect?.();
  }
}

main();
