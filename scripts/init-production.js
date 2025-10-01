const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Production database initialization...');
  
  try {
    // データベース接続テスト
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // テストユーザーを確認/作成
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: '管理者',
          role: 'admin'
        }
      });
      
      console.log('✅ Admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    // エラーがあっても続行
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
main().then(() => {
  console.log('🎉 Initialization complete!');
}).catch(console.error);