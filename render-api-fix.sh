#!/bin/bash

# Render API を使用してエラーを自動解消するスクリプト
API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
API_URL="https://api.render.com/v1"

echo "🔍 Render APIでサービスを検査中..."

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 現在のサービス一覧を取得
echo -e "${YELLOW}📋 サービス一覧を取得中...${NC}"
SERVICES=$(curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/services?limit=20")

# サービスIDを抽出（task3関連のサービスを探す）
SERVICE_ID=$(echo "$SERVICES" | jq -r '.[] | select(.service.name | contains("task")) | .service.id' | head -1)

if [ -z "$SERVICE_ID" ]; then
    echo -e "${RED}❌ taskサービスが見つかりません${NC}"
    echo "新規サービスを作成しますか？"
    
    # 新規サービス作成
    echo -e "${GREEN}✨ 新規Webサービスを作成中...${NC}"
    
    CREATE_RESPONSE=$(curl -s -X POST "$API_URL/services" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "web_service",
        "name": "task3-app",
        "repo": {
          "url": "https://github.com/komi-kou/task3",
          "branch": "main",
          "autoDeploy": true
        },
        "plan": "free",
        "region": "oregon",
        "buildCommand": "npm install && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build",
        "startCommand": "npm start",
        "envVars": {
          "NODE_ENV": "production",
          "NEXTAUTH_SECRET": "your-secret-key-here-change-in-production-32chars",
          "NEXTAUTH_URL": "https://task3-app.onrender.com"
        },
        "rootDir": ""
      }')
    
    NEW_SERVICE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.service.id')
    
    if [ "$NEW_SERVICE_ID" != "null" ] && [ -n "$NEW_SERVICE_ID" ]; then
        echo -e "${GREEN}✅ サービス作成成功: $NEW_SERVICE_ID${NC}"
        SERVICE_ID=$NEW_SERVICE_ID
    else
        echo -e "${RED}❌ サービス作成失敗${NC}"
        echo "レスポンス: $CREATE_RESPONSE"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 既存サービス検出: $SERVICE_ID${NC}"
fi

# 2. サービスの詳細を取得
echo -e "${YELLOW}📊 サービス詳細を取得中...${NC}"
SERVICE_DETAILS=$(curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/services/$SERVICE_ID")
echo "サービス名: $(echo "$SERVICE_DETAILS" | jq -r '.name')"
echo "ステータス: $(echo "$SERVICE_DETAILS" | jq -r '.serviceDetails.status')"

# 3. ビルドログを取得
echo -e "${YELLOW}📜 最新のビルドログを取得中...${NC}"
BUILD_LOGS=$(curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/services/$SERVICE_ID/deploys?limit=1")
LATEST_DEPLOY_ID=$(echo "$BUILD_LOGS" | jq -r '.[0].deploy.id')

if [ -n "$LATEST_DEPLOY_ID" ] && [ "$LATEST_DEPLOY_ID" != "null" ]; then
    echo "最新デプロイID: $LATEST_DEPLOY_ID"
    
    # エラーログを確認
    LOGS=$(curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/services/$SERVICE_ID/deploys/$LATEST_DEPLOY_ID/logs")
    
    # エラーパターンを検出
    if echo "$LOGS" | grep -q "Module not found.*globals.css"; then
        echo -e "${RED}⚠️  検出: globals.cssインポートエラー${NC}"
        NEEDS_FIX=true
    fi
    
    if echo "$LOGS" | grep -q "Module not found.*providers"; then
        echo -e "${RED}⚠️  検出: providersインポートエラー${NC}"
        NEEDS_FIX=true
    fi
fi

# 4. 環境変数を更新
echo -e "${YELLOW}🔧 環境変数を設定中...${NC}"

# DATABASE_URL設定（PostgreSQLが必要な場合）
if ! echo "$SERVICE_DETAILS" | jq -e '.envVars | has("DATABASE_URL")' > /dev/null; then
    echo -e "${YELLOW}📦 PostgreSQLデータベースを作成中...${NC}"
    
    DB_RESPONSE=$(curl -s -X POST "$API_URL/services" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "postgres",
        "name": "task3-database",
        "plan": "free",
        "region": "oregon",
        "version": "15"
      }')
    
    DB_ID=$(echo "$DB_RESPONSE" | jq -r '.service.id')
    
    if [ "$DB_ID" != "null" ] && [ -n "$DB_ID" ]; then
        echo -e "${GREEN}✅ データベース作成成功${NC}"
        
        # データベース接続情報を取得
        sleep 5
        DB_DETAILS=$(curl -s -H "Authorization: Bearer $API_KEY" "$API_URL/services/$DB_ID")
        DB_URL=$(echo "$DB_DETAILS" | jq -r '.serviceDetails.connectionString')
        
        # WebサービスにDATABASE_URLを設定
        curl -s -X PATCH "$API_URL/services/$SERVICE_ID/env-vars" \
          -H "Authorization: Bearer $API_KEY" \
          -H "Content-Type: application/json" \
          -d "{\"envVars\": {\"DATABASE_URL\": \"$DB_URL\"}}"
        
        echo -e "${GREEN}✅ DATABASE_URL設定完了${NC}"
    fi
fi

# 5. ビルド設定を更新（エラー修正）
if [ "$NEEDS_FIX" = true ]; then
    echo -e "${YELLOW}🔨 ビルド設定を修正中...${NC}"
    
    UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/services/$SERVICE_ID" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "buildCommand": "npm ci && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build",
        "startCommand": "npx prisma db push --schema=./prisma/schema.production.prisma && npm start"
      }')
    
    echo -e "${GREEN}✅ ビルド設定更新完了${NC}"
fi

# 6. 手動デプロイをトリガー
echo -e "${YELLOW}🚀 手動デプロイを開始中...${NC}"
DEPLOY_RESPONSE=$(curl -s -X POST "$API_URL/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": true}')

DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.deploy.id')

if [ "$DEPLOY_ID" != "null" ] && [ -n "$DEPLOY_ID" ]; then
    echo -e "${GREEN}✅ デプロイ開始: $DEPLOY_ID${NC}"
    echo ""
    echo "📌 デプロイ状態を確認:"
    echo "https://dashboard.render.com/web/$SERVICE_ID/deploys/$DEPLOY_ID"
else
    echo -e "${RED}❌ デプロイ開始失敗${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Render API処理完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "サービスID: $SERVICE_ID"
echo "ダッシュボード: https://dashboard.render.com/"
echo ""
echo "ログを確認: curl -s -H \"Authorization: Bearer $API_KEY\" \"$API_URL/services/$SERVICE_ID/deploys/$DEPLOY_ID/logs\""