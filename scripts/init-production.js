const { execSync } = require('child_process');

console.log('🚀 初回本番環境セットアップ開始...');

try {
  // Prismaデータベーススキーマを適用
  console.log('📊 データベーススキーマを適用中...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ データベースセットアップ完了');
  
  // テストユーザーを作成
  console.log('👤 テストユーザーを作成中...');
  require('../init-db.js');
  
} catch (error) {
  console.error('❌ セットアップエラー:', error);
  // エラーがあっても続行（既にデータベースが初期化されている場合があるため）
}

console.log('🎉 初期化完了！');