import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

// 各リクエストで新しいPrismaClientインスタンスを作成
async function getDbClient() {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  })
  
  try {
    await prisma.$connect()
    return prisma
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }
}

export async function POST(req: Request) {
  let prisma: PrismaClient | null = null
  
  try {
    const body = await req.json()
    const { email, password, name } = body

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードは必須です" },
        { status: 400 }
      )
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      )
    }

    // パスワードの長さチェック
    if (password.length < 6) {
      return NextResponse.json(
        { error: "パスワードは6文字以上で入力してください" },
        { status: 400 }
      )
    }

    // データベース接続
    try {
      prisma = await getDbClient()
    } catch (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { error: "データベースに接続できません。しばらく待ってから再試行してください" },
        { status: 503 }
      )
    }

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      )
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'user'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: "登録が完了しました",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Prismaエラーの詳細な処理
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2021' || error.code === 'P2022') {
      return NextResponse.json(
        { error: "データベースが初期化されていません。管理者に連絡してください" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "登録処理中にエラーが発生しました",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}