import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

// ꯨ��g�WDPrismaClient���\
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

    // �������
    if (!email || !password) {
      return NextResponse.json(
        { error: "�����hѹ���o�gY" },
        { status: 400 }
      )
    }

    // �����nb��ï
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "	�j����칒e�WfO`UD" },
        { status: 400 }
      )
    }

    // ѹ���nwU��ï
    if (password.length < 6) {
      return NextResponse.json(
        { error: "ѹ���o6�W�
ge�WfO`UD" },
        { status: 400 }
      )
    }

    // ��������
    try {
      prisma = await getDbClient()
    } catch (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { error: "������k��gM~[�Wp�O�cfK��fLWfO`UD" },
        { status: 503 }
      )
    }

    // �X������ï
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Sn�����o�k{2U�fD~Y" },
        { status: 400 }
      )
    }

    // ѹ���n�÷�
    const hashedPassword = await bcrypt.hash(password, 12)

    // ����\
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
      message: "{2L��W~W_",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Prisma���ns0j�
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Sn�����o�k(U�fD~Y" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2021' || error.code === 'P2022') {
      return NextResponse.json(
        { error: "������LU�fD~[��k#aWfO`UD" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "{2�-k���LzW~W_",
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