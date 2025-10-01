import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get current and previous month dates
    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)
    const startOfLastMonth = startOfMonth(subMonths(now, 1))
    const endOfLastMonth = endOfMonth(subMonths(now, 1))

    // Fetch all data in parallel
    const [
      customersData,
      currentMonthCustomers,
      lastMonthCustomers,
      tasks,
      leads,
      opportunities,
      recentActivities
    ] = await Promise.all([
      prisma.customer.findMany({ 
        where: { userId },
        select: {
          contractAmount: true,
          contractDate: true,
          industry: true,
          annualRevenue: true
        }
      }),
      prisma.customer.count({
        where: {
          userId,
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth
          }
        }
      }),
      prisma.customer.count({
        where: {
          userId,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),
      prisma.task.findMany({
        where: { userId },
        select: {
          status: true,
          priority: true,
          createdAt: true,
          completedAt: true
        }
      }),
      prisma.lead.findMany({
        where: { userId },
        select: {
          status: true,
          score: true,
          createdAt: true
        }
      }),
      prisma.opportunity.findMany({
        where: { userId },
        select: {
          amount: true,
          stage: true,
          probability: true,
          closeDate: true,
          createdAt: true
        }
      }),
      prisma.task.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          customer: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Calculate task statistics
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    }

    // Calculate lead statistics
    const leadStats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      averageScore: leads.length > 0 ? leads.reduce((acc, l) => acc + l.score, 0) / leads.length : 0
    }

    // Calculate opportunity statistics
    const opportunityStats = {
      total: opportunities.length,
      totalValue: opportunities.reduce((acc, o) => acc + (o.amount || 0), 0),
      averageValue: opportunities.length > 0 ? opportunities.reduce((acc, o) => acc + (o.amount || 0), 0) / opportunities.length : 0,
      byStage: {
        qualification: opportunities.filter(o => o.stage === 'qualification').length,
        proposal: opportunities.filter(o => o.stage === 'proposal').length,
        negotiation: opportunities.filter(o => o.stage === 'negotiation').length,
        closed: opportunities.filter(o => o.stage === 'closed').length
      }
    }

    // Calculate customer statistics
    const totalCustomers = customersData.length
    const totalContractAmount = customersData.reduce((sum, c) => sum + (c.contractAmount || 0), 0)
    const averageContractAmount = totalCustomers > 0 ? totalContractAmount / totalCustomers : 0
    const customersWithContracts = customersData.filter(c => c.contractAmount && c.contractAmount > 0).length
    const totalAnnualRevenue = customersData.reduce((sum, c) => sum + (c.annualRevenue || 0), 0)
    
    // Group customers by industry
    const customersByIndustry = customersData.reduce((acc, c) => {
      const industry = c.industry || '未分類'
      acc[industry] = (acc[industry] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate customer growth rate
    const customerGrowthRate = lastMonthCustomers > 0 
      ? ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 
      : 100

    // Prepare monthly data for charts (last 6 months) based on contract date
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      
      // Count customers by contract date
      const monthContracts = await prisma.customer.findMany({
        where: {
          userId,
          contractDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          contractAmount: true
        }
      })
      
      const monthCustomerCount = monthContracts.length
      const monthContractAmount = monthContracts.reduce((sum, c) => sum + (c.contractAmount || 0), 0)
      
      const monthTasks = await prisma.task.findMany({
        where: {
          userId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          status: true
        }
      })
      
      const totalTasks = monthTasks.length
      const completedTasks = monthTasks.filter(t => t.status === 'completed').length
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      
      monthlyData.push({
        month: monthStart.toISOString(),
        customers: monthCustomerCount,
        tasks: totalTasks,
        completedTasks: completedTasks,
        taskCompletionRate: taskCompletionRate,
        revenue: monthContractAmount
      })
    }

    // Prepare monthly revenue data for charts (last 6 months) - based on customer contracts
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      
      // Get contracts in this month
      const monthCustomerContracts = await prisma.customer.findMany({
        where: {
          userId,
          contractDate: {
            gte: monthStart,
            lte: monthEnd
          },
          contractAmount: {
            gt: 0
          }
        },
        select: {
          contractAmount: true
        }
      })
      
      const totalContractAmount = monthCustomerContracts.reduce((sum, c) => sum + (c.contractAmount || 0), 0)
      
      // Also get closed opportunities in this month
      const monthClosedDeals = await prisma.opportunity.findMany({
        where: {
          userId,
          stage: 'closed',
          closeDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          amount: true
        }
      })
      
      const opportunityAmount = monthClosedDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
      
      // Get lead conversion data
      const monthLeads = await prisma.lead.findMany({
        where: {
          userId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          status: true
        }
      })
      
      const totalLeads = monthLeads.length
      const qualifiedLeads = monthLeads.filter(l => l.status === 'qualified').length
      const leadConversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0
      
      monthlyRevenue.push({
        month: monthStart.toISOString(),
        amount: totalContractAmount, // Use contract amount as primary revenue
        deals: monthCustomerContracts.length,
        opportunityAmount: opportunityAmount, // Keep opportunity amount separate
        totalLeads: totalLeads,
        qualifiedLeads: qualifiedLeads,
        leadConversionRate: leadConversionRate
      })
    }

    // Get upcoming and overdue tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const overdueTasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { lt: today },
        status: { 
          notIn: ['completed', 'cancelled']
        }
      },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    })

    const todayTasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: today,
          lt: tomorrow
        },
        status: { 
          notIn: ['completed', 'cancelled']
        }
      },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    const upcomingTasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: tomorrow,
          lt: nextWeek
        },
        status: { 
          notIn: ['completed', 'cancelled']
        }
      },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    })

    return NextResponse.json({
      customers: {
        total: totalCustomers,
        currentMonth: currentMonthCustomers,
        lastMonth: lastMonthCustomers,
        growthRate: customerGrowthRate,
        totalContractAmount,
        averageContractAmount,
        customersWithContracts,
        totalAnnualRevenue,
        byIndustry: customersByIndustry
      },
      tasks: taskStats,
      leads: leadStats,
      opportunities: opportunityStats,
      monthlyData,
      monthlyRevenue,
      recentActivities,
      taskReminders: {
        overdue: overdueTasks,
        today: todayTasks,
        upcoming: upcomingTasks
      }
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}