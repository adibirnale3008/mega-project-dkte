const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.krwxffcbqqfnobsipwzg:Aditya%403008a@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: connectionString
        }
    },
    log: ['error', 'warn']
});

module.exports = prisma;
