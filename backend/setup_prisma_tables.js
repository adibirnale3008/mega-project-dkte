require('dotenv').config();
const prisma = require('./config/prisma');

async function testSupabaseConnection() {
    try {
        console.log('Connecting to Supabase PostgreSQL database via Prisma ORM...');
        await prisma.$connect();
        console.log('✅ [PRISMA SUCCESS] Connected to Supabase PostgreSQL cloud database!');

        // Check tables by attempting count queries
        const userCount = await prisma.user.count();
        const newsCheckCount = await prisma.newsCheck.count();

        console.log(`[PRISMA DB STATUS] Existing Records in Supabase:`);
        console.log(`  - Users: ${userCount}`);
        console.log(`  - News Checks: ${newsCheckCount}`);

    } catch (error) {
        console.error('🔴 [PRISMA ERROR] Could not connect or query Supabase database:');
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testSupabaseConnection();
