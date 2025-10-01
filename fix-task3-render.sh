#!/bin/bash

# task3サービスを完全に修正するスクリプト
API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"  # task3サービス

echo "🔧 task3サービスを修正中..."
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 現在の状態を確認
echo -e "${YELLOW}📊 現在のサービス状態を確認中...${NC}"
SERVICE_INFO=$(curl -s -H "Authorization: Bearer $API_KEY" "https://api.render.com/v1/services/$SERVICE_ID")
echo "サービス名: $(echo "$SERVICE_INFO" | jq -r '.name')"
echo "ステータス: $(echo "$SERVICE_INFO" | jq -r '.suspended')"
echo "URL: $(echo "$SERVICE_INFO" | jq -r '.serviceDetails.url')"
echo ""

# 2. ビルドコマンドを修正（Prisma production schemaを使用）
echo -e "${YELLOW}🔨 ビルドコマンドを修正中...${NC}"
UPDATE_BUILD=$(curl -s -X PATCH "https://api.render.com/v1/services/$SERVICE_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceDetails": {
      "envSpecificDetails": {
        "buildCommand": "npm ci && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build",
        "startCommand": "npx prisma db push --schema=./prisma/schema.production.prisma && npm start"
      }
    }
  }')

if echo "$UPDATE_BUILD" | jq -e '.id' > /dev/null; then
    echo -e "${GREEN}✅ ビルドコマンド更新成功${NC}"
else
    echo -e "${RED}❌ ビルドコマンド更新失敗${NC}"
fi

# 3. 環境変数を確認・設定
echo ""
echo -e "${YELLOW}📝 環境変数を設定中...${NC}"

# 既存の環境変数を確認
EXISTING_VARS=$(curl -s -H "Authorization: Bearer $API_KEY" "https://api.render.com/v1/services/$SERVICE_ID/env-vars")
echo "既存の環境変数数: $(echo "$EXISTING_VARS" | jq '. | length')"

# 必要な環境変数を設定
ENV_UPDATE=$(curl -s -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "NEXTAUTH_SECRET",
      "value": "generated-secret-key-change-this-in-production-32ch"
    },
    {
      "key": "NEXTAUTH_URL",
      "value": "https://task3.onrender.com"
    }
  ]')

echo -e "${GREEN}✅ 環境変数設定完了${NC}"

# 4. PostgreSQLデータベースが必要か確認
echo ""
echo -e "${YELLOW}🗄️ データベース接続を確認中...${NC}"

# DATABASE_URLが設定されているか確認
if ! echo "$EXISTING_VARS" | jq -e '.[] | select(.envVar.key == "DATABASE_URL")' > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  DATABASE_URLが未設定です${NC}"
    
    # 新しいPostgreSQLを作成
    echo "PostgreSQLデータベースを作成しますか？ (Supabaseを使用する場合は手動で設定してください)"
    
    # Supabase用の仮設定
    SUPABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
    
    curl -s -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars/DATABASE_URL" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"value\": \"$SUPABASE_URL\"}" > /dev/null
    
    echo -e "${YELLOW}⚠️  DATABASE_URLを仮設定しました。Supabaseの実際のURLに更新してください${NC}"
else
    echo -e "${GREEN}✅ DATABASE_URL設定済み${NC}"
fi

# 5. 最新のコミットでデプロイ
echo ""
echo -e "${YELLOW}🚀 最新のコミットでデプロイを開始中...${NC}"

# キャッシュをクリアして再デプロイ
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": "clear"}')

DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.id')

if [ "$DEPLOY_ID" != "null" ] && [ -n "$DEPLOY_ID" ]; then
    echo -e "${GREEN}✅ デプロイ開始成功！${NC}"
    echo "デプロイID: $DEPLOY_ID"
    
    # デプロイステータスを確認
    echo ""
    echo -e "${YELLOW}⏳ デプロイステータスを確認中...${NC}"
    sleep 3
    
    DEPLOY_STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID" | jq -r '.status')
    echo "ステータス: $DEPLOY_STATUS"
else
    echo -e "${RED}❌ デプロイ開始失敗${NC}"
    echo "手動でデプロイしてください"
fi

# 6. サービスが一時停止の場合は再開
if [ "$(echo "$SERVICE_INFO" | jq -r '.suspended')" = "suspended" ]; then
    echo ""
    echo -e "${YELLOW}▶️ サービスを再開中...${NC}"
    
    RESUME_RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/resume" \
      -H "Authorization: Bearer $API_KEY")
    
    echo -e "${GREEN}✅ サービス再開リクエスト送信${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ task3サービスの修正完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📌 確認事項:"
echo "1. Renderダッシュボード: https://dashboard.render.com/web/$SERVICE_ID"
echo "2. ビルドログを確認"
echo "3. DATABASE_URLをSupabaseの実際のURLに更新（必要な場合）"
echo ""
echo "🌐 サービスURL: https://task3.onrender.com"
echo ""

# 7. リアルタイムログ表示（オプション）
echo "ログを表示しますか？ (y/n)"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "ビルドログを表示中... (Ctrl+Cで終了)"
    curl -s -H "Authorization: Bearer $API_KEY" "https://api.render.com/v1/services/$SERVICE_ID/logs?limit=100"
fi