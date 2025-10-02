#!/usr/bin/env node

console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set');

if (!process.env.DATABASE_URL) {
  console.error('\n❌ DATABASE_URL is not set!');
  console.error('Please set DATABASE_URL in Render environment variables');
  process.exit(1);
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error('\n❌ NEXTAUTH_SECRET is not set!');
  console.error('Please set NEXTAUTH_SECRET in Render environment variables');
  process.exit(1);
}

console.log('\n✅ All required environment variables are set');

// Test database connection
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();