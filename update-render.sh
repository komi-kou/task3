#!/bin/bash

# Render サービスを更新するスクリプト
API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3efaeh5pdvs7394f7pg"

echo "🔧 Renderサービスを修正中..."

# 1. 環境変数を設定
echo "📝 環境変数を設定中..."
curl -s -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "key": "DATABASE_URL",
      "value": "postgresql://postgres:password@localhost:5432/taskdb"
    },
    {
      "key": "NEXTAUTH_SECRET",
      "value": "your-secret-key-here-change-in-production-32chars"
    },
    {
      "key": "NEXTAUTH_URL",
      "value": "https://task3-1.onrender.com"
    },
    {
      "key": "NODE_ENV",
      "value": "production"
    }
  ]'

echo ""
echo "✅ 環境変数設定完了"

# 2. サービス設定を更新
echo "🔨 ビルド設定を更新中..."

# 正しいフォーマットでPATCHリクエスト
RESPONSE=$(curl -s -X PATCH "https://api.render.com/v1/services/$SERVICE_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceDetails": {
      "buildCommand": "npm ci && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build",
      "startCommand": "npm start"
    }
  }')

echo "レスポンス: $RESPONSE"

# 3. 手動デプロイをトリガー
echo "🚀 デプロイを開始中..."
DEPLOY=$(curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": "clear"}')

DEPLOY_ID=$(echo "$DEPLOY" | jq -r '.id')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 設定完了！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Renderダッシュボードで確認:"
echo "https://dashboard.render.com/web/$SERVICE_ID"
echo ""
echo "デプロイID: $DEPLOY_ID"