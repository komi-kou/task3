import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

// ê¯¨¹Èg°WDPrismaClient¤ó¹¿ó¹’\
async function getDbClient() {
  const databaseUrl = process.env.DATABASE_URL
  console.log('Register - Database URL configured:', databaseUrl ? 'Yes' : 'No')
  console.log('Register - NODE_ENV:', process.env.NODE_ENV)
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
  
  try {
    await prisma.$connect()
    console.log('Register - Database connected successfully')
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

    // ÐêÇü·çó
    if (!email || !password) {
      return NextResponse.json(
        { error: "áüë¢Éì¹hÑ¹ïüÉoÅgY" },
        { status: 400 }
      )
    }

    // áüë¢Éì¹nbÁ§Ã¯
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "	¹jáüë¢Éì¹’e›WfO`UD" },
        { status: 400 }
      )
    }

    // Ñ¹ïüÉnwUÁ§Ã¯
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Ñ¹ïüÉo6‡Wå
ge›WfO`UD" },
        { status: 400 }
      )
    }

    // Çü¿Ùü¹¥š
    try {
      prisma = await getDbClient()
    } catch (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { error: "Çü¿Ùü¹k¥šgM~[“Wp‰O…cfK‰fLWfO`UD" },
        { status: 503 }
      )
    }

    // âXæü¶üÁ§Ã¯
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Snáüë¢Éì¹oâk{2UŒfD~Y" },
        { status: 400 }
      )
    }

    // Ñ¹ïüÉnÏÃ·å
    const hashedPassword = await bcrypt.hash(password, 12)

    // æü¶ü\
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
      message: "{2LŒ†W~W_",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Prisma¨éüns0jæ
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Snáüë¢Éì¹oâk(UŒfD~Y" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2021' || error.code === 'P2022') {
      return NextResponse.json(
        { error: "Çü¿Ùü¹LUŒfD~[“¡k#aWfO`UD" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "{2æ-k¨éüLzW~W_",
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