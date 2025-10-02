import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate,
      startDate,
      estimatedHours,
      assignee,
      category,
      tags,
      progress,
      customerId 
    } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "not_started",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        estimatedHours: estimatedHours || null,
        assignee: assignee || null,
        category: category === 'none' ? null : category || null,
        tags: tags || null,
        progress: progress || 0,
        userId: session.user.id,
        customerId: customerId === 'none' ? null : customerId || null
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Task creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create task" },
      { status: 500 }
    )
  }
}