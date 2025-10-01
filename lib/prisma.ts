import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// PrismaClientをシングルトンとして管理
const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in environment variables')
    throw new Error('DATABASE_URL is not defined')
  }
  
  console.log('PrismaClient - Creating new instance')
  console.log('PrismaClient - Database URL configured:', databaseUrl ? 'Yes' : 'No')
  console.log('PrismaClient - NODE_ENV:', process.env.NODE_ENV)
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma