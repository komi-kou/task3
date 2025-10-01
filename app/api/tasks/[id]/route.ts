import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const updateData: any = { ...body }
    
    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate)
    }
    
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate)
    }
    
    if (body.status === "completed" && !body.completedAt) {
      updateData.completedAt = new Date()
      updateData.progress = 100
    }
    
    // 数値フィールドの処理
    if (typeof body.estimatedHours === 'string') {
      updateData.estimatedHours = parseFloat(body.estimatedHours) || null
    }
    if (typeof body.actualHours === 'string') {
      updateData.actualHours = parseFloat(body.actualHours) || null
    }
    if (typeof body.progress === 'string') {
      updateData.progress = parseInt(body.progress) || 0
    }

    const task = await prisma.task.update({
      where: {
        id: id
      },
      data: updateData
    })

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.task.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}