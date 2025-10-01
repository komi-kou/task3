const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Database initialization starting...')
  
  try {
    // 接続確認
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // 管理者ユーザーの作成
    const adminEmail = 'admin@example.com'
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
      
      console.log('✅ Admin user created')
      console.log('   Email:', adminEmail)
      console.log('   Password: admin123')
      console.log('   ID:', admin.id)
    } else {
      console.log('ℹ️  Admin user already exists')
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
      
      console.log('✅ Test user created')
      console.log('   Email:', testEmail)
      console.log('   Password: test123')
      console.log('   ID:', testUser.id)
    } else {
      console.log('ℹ️  Test user already exists')
    }
    
    // ユーザー数の確認
    const userCount = await prisma.user.count()
    console.log(`\n📊 Total users in database: ${userCount}`)
    
    console.log('\n✅ Database initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 直接実行された場合
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .then(() => {
      process.exit(0)
    })
}

module.exports = main