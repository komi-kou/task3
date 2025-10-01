import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  // セキュリティのため、初期化キーをチェック
  const { searchParams } = new URL(req.url)
  const initKey = searchParams.get('key')
  
  if (initKey !== 'init-db-2024') {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const databaseUrl = process.env.DATABASE_URL
  console.log('Init - Database URL configured:', databaseUrl ? 'Yes' : 'No')
  console.log('Init - NODE_ENV:', process.env.NODE_ENV)
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

  try {
    // データベース接続
    await prisma.$connect()
    console.log('Connected to database')

    // 管理者ユーザーの作成
    const adminEmail = 'admin@example.com'
    
    // 既存のユーザーをチェック
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: '管理者',
          role: 'admin'
        }
      })
      
      console.log('Admin user created:', admin.id)
    }

    // テストユーザーの作成
    const testEmail = 'test@example.com'
    
    const existingTest = await prisma.user.findUnique({
      where: { email: testEmail }
    })

    if (!existingTest) {
      const hashedPassword = await bcrypt.hash('test123', 12)
      
      const testUser = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          name: 'テストユーザー',
          role: 'user'
        }
      })
      
      console.log('Test user created:', testUser.id)
    }

    // デモユーザーの作成
    const demoUsers = [
      { email: 'demo1@example.com', password: 'demo123', name: 'デモユーザー1' },
      { email: 'demo2@example.com', password: 'demo123', name: 'デモユーザー2' },
      { email: 'demo3@example.com', password: 'demo123', name: 'デモユーザー3' }
    ]

    for (const demoUser of demoUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: demoUser.email }
      })

      if (!existing) {
        const hashedPassword = await bcrypt.hash(demoUser.password, 12)
        
        await prisma.user.create({
          data: {
            email: demoUser.email,
            password: hashedPassword,
            name: demoUser.name,
            role: 'user'
          }
        })
        
        console.log('Demo user created:', demoUser.email)
      }
    }

    // 全ユーザー数を取得
    const userCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      userCount,
      users: [
        { email: 'admin@example.com', password: 'admin123', role: 'admin' },
        { email: 'test@example.com', password: 'test123', role: 'user' },
        { email: 'demo1@example.com', password: 'demo123', role: 'user' },
        { email: 'demo2@example.com', password: 'demo123', role: 'user' },
        { email: 'demo3@example.com', password: 'demo123', role: 'user' }
      ]
    })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}