#!/bin/bash

# Render API自動デプロイスクリプト
# API Key: rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog

echo "🚀 Render API を使用した自動デプロイを開始します..."

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# API設定
API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
API_URL="https://api.render.com/v1"

# GitHubリポジトリ情報（要変更）
GITHUB_REPO="https://github.com/YOUR_USERNAME/crm-task-manager"
BRANCH="main"

echo -e "${YELLOW}📋 現在のサービスを確認中...${NC}"

# 既存のサービスを確認
SERVICES=$(curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/services")
echo "現在のサービス数: $(echo $SERVICES | jq '.length')"

# PostgreSQLデータベースを作成
echo -e "${YELLOW}🗄️ PostgreSQLデータベースを作成中...${NC}"

DB_RESPONSE=$(curl -s -X POST "$API_URL/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "postgres",
    "name": "crm-database",
    "plan": "free",
    "region": "oregon"
  }')

DB_ID=$(echo $DB_RESPONSE | jq -r '.id')
DB_URL=$(echo $DB_RESPONSE | jq -r '.connectionString')

if [ "$DB_ID" != "null" ]; then
    echo -e "${GREEN}✅ データベース作成成功: $DB_ID${NC}"
else
    echo -e "${RED}❌ データベース作成失敗${NC}"
    echo "レスポンス: $DB_RESPONSE"
fi

# Webサービスを作成
echo -e "${YELLOW}🌐 Webサービスを作成中...${NC}"

WEB_RESPONSE=$(curl -s -X POST "$API_URL/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "crm-task-manager",
    "repo": "'$GITHUB_REPO'",
    "branch": "'$BRANCH'",
    "plan": "free",
    "region": "oregon",
    "buildCommand": "npm ci && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build",
    "startCommand": "npx prisma migrate deploy --schema=./prisma/schema.production.prisma && npm start",
    "envVars": [
      {
        "key": "DATABASE_URL",
        "value": "'$DB_URL'"
      },
      {
        "key": "NEXTAUTH_SECRET",
        "value": "generated-secret-here-change-this"
      },
      {
        "key": "NEXTAUTH_URL",
        "value": "https://crm-task-manager.onrender.com"
      },
      {
        "key": "NODE_ENV",
        "value": "production"
      }
    ]
  }')

WEB_ID=$(echo $WEB_RESPONSE | jq -r '.id')
WEB_URL=$(echo $WEB_RESPONSE | jq -r '.serviceDetails.url')

if [ "$WEB_ID" != "null" ]; then
    echo -e "${GREEN}✅ Webサービス作成成功: $WEB_ID${NC}"
    echo -e "${GREEN}URL: $WEB_URL${NC}"
else
    echo -e "${RED}❌ Webサービス作成失敗${NC}"
    echo "レスポンス: $WEB_RESPONSE"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 デプロイ設定が完了しました！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📌 次のステップ:"
echo "1. GitHubリポジトリURLを設定してください"
echo "2. Renderダッシュボードでビルドステータスを確認"
echo "3. デプロイ完了後、URLにアクセス"
echo ""
echo "Renderダッシュボード: https://dashboard.render.com/"