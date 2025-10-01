const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { subMonths, startOfMonth } = require('date-fns')

const prisma = new PrismaClient()

async function main() {
  try {
    // Create a demo user
    const password = await bcrypt.hash('demo123', 10)
    const user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password,
        name: 'Demo User',
        role: 'admin'
      }
    })
    
    console.log('Created demo user:', user.email)

    // Create sample opportunities for revenue chart
    const now = new Date()
    const opportunityData = [
      { month: 5, amount: 1500000, closed: 3 },
      { month: 4, amount: 2300000, closed: 5 },
      { month: 3, amount: 1800000, closed: 4 },
      { month: 2, amount: 3200000, closed: 7 },
      { month: 1, amount: 2800000, closed: 6 },
      { month: 0, amount: 3500000, closed: 8 }
    ]

    for (const data of opportunityData) {
      const closeDate = startOfMonth(subMonths(now, data.month))
      const dealCount = data.closed
      const avgAmount = data.amount / dealCount

      for (let i = 0; i < dealCount; i++) {
        await prisma.opportunity.create({
          data: {
            name: `商談 ${data.month + 1}月-${i + 1}`,
            amount: avgAmount + (Math.random() * 200000 - 100000),
            stage: 'closed',
            probability: 100,
            closeDate: new Date(closeDate.getTime() + Math.random() * 28 * 24 * 60 * 60 * 1000),
            description: `${data.month + 1}月の成約案件`,
            userId: user.id
          }
        })
      }
    }

    console.log('Sample data created successfully!')
    console.log('Login with: demo@example.com / demo123')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()