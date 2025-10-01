import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET(req: Request) {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  })

  try {
    // データベース接続テスト
    await prisma.$connect()
    
    // ユーザー数を取得してデータベースが動作しているか確認
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
    })
  } catch (error: any) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}