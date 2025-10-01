#!/bin/bash

# CRM Task Manager - 自動デプロイスクリプト
# このスクリプトは初回セットアップを自動化します

echo "🚀 CRM Task Manager 自動デプロイを開始します..."
echo ""

# 色付き出力用の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# エラーハンドリング
set -e
trap 'echo -e "${RED}エラーが発生しました。処理を中断します。${NC}"' ERR

# 1. 必要なツールの確認
echo "📋 必要なツールを確認中..."

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Gitがインストールされていません${NC}"
    echo "Gitをインストールしてください: https://git-scm.com/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.jsがインストールされていません${NC}"
    echo "Node.jsをインストールしてください: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npmがインストールされていません${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 必要なツールが確認されました${NC}"
echo ""

# 2. 環境変数のセットアップ
echo "🔧 環境変数をセットアップ中..."

if [ ! -f .env.local ]; then
    echo "DATABASE_URL=\"file:./dev.db\"" > .env.local
    echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env.local
    echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.local
    echo -e "${GREEN}✅ .env.localを作成しました${NC}"
else
    echo -e "${YELLOW}⚠️  .env.localは既に存在します${NC}"
fi

# 3. 依存関係のインストール
echo ""
echo "📦 依存関係をインストール中..."
npm install

# 4. Prismaのセットアップ
echo ""
echo "🗄️  データベースをセットアップ中..."
npx prisma generate
npx prisma db push

# 5. Vercel CLIのインストール確認
echo ""
echo "🔧 Vercel CLIを確認中..."

if ! command -v vercel &> /dev/null; then
    echo "Vercel CLIをインストール中..."
    npm i -g vercel
fi

# 6. デプロイ前の確認
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📌 デプロイ前の確認事項${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1️⃣  Supabaseアカウントを作成しましたか？"
echo "   → https://supabase.com でアカウント作成"
echo ""
echo "2️⃣  Supabaseでプロジェクトを作成しましたか？"
echo "   → データベースURLを取得してください"
echo ""
echo "3️⃣  GitHubリポジトリを作成しましたか？"
echo "   → コードをプッシュする準備をしてください"
echo ""
echo "4️⃣  Vercelアカウントを作成しましたか？"
echo "   → https://vercel.com でアカウント作成"
echo ""

read -p "上記の準備が完了していますか？ (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "準備が完了したら、再度このスクリプトを実行してください。"
    exit 0
fi

# 7. Gitリポジトリの初期化
echo ""
echo "📝 Gitリポジトリを準備中..."

if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo -e "${GREEN}✅ Gitリポジトリを初期化しました${NC}"
else
    echo -e "${YELLOW}⚠️  Gitリポジトリは既に存在します${NC}"
fi

# 8. Vercelデプロイ
echo ""
echo "🚀 Vercelにデプロイを開始します..."
echo ""
echo -e "${YELLOW}次の画面でVercelの設定を行います:${NC}"
echo "1. GitHubと連携してください"
echo "2. 環境変数を設定してください:"
echo "   - DATABASE_URL (Supabaseから取得)"
echo "   - NEXTAUTH_SECRET (自動生成済み)"
echo "   - NEXTAUTH_URL (デプロイ後に更新)"
echo ""
read -p "続行しますか？ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 デプロイが完了しました！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "📌 次のステップ:"
    echo "1. Vercelダッシュボードで環境変数を確認"
    echo "2. NEXTAUTH_URLを実際のURLに更新"
    echo "3. 再デプロイを実行"
    echo ""
    echo "詳細は AUTO_DEPLOY_GUIDE.md を参照してください。"
else
    echo "デプロイをキャンセルしました。"
fi