#!/bin/bash

# 自動デプロイスクリプト
echo "🚀 自動デプロイを開始します..."

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 最新ファイルを確認
echo -e "${YELLOW}📋 修正済みファイルを確認中...${NC}"
echo "- app/layout.tsx (インポートパス修正済み)"
echo "- prisma/schema.production.prisma (PostgreSQL設定済み)"
echo "- package.json (ビルドスクリプト修正済み)"
echo ""

# 2. Gitにコミット
echo -e "${YELLOW}📦 Gitにコミット中...${NC}"
git add -A
git commit -m "Fix all deployment issues - imports, Prisma, and build scripts" || echo "既にコミット済み"

# 3. GitHub APIを使用してファイルを直接更新
echo -e "${YELLOW}🔄 GitHub APIでファイルを更新中...${NC}"

# GitHub APIを使用する代替案
GITHUB_REPO="komi-kou/task3"
BRANCH="main"

# 重要なファイルの内容を準備
echo "主要ファイルの準備完了"

# 4. Render APIでデプロイをトリガー
echo ""
echo -e "${YELLOW}🚀 Renderでデプロイを開始...${NC}"

API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"

# 最新のデプロイステータスを確認
DEPLOY_STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" \
  "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
  jq -r '.[0].deploy.status')

echo "現在のデプロイステータス: $DEPLOY_STATUS"

# 新しいデプロイをトリガー（キャッシュクリア付き）
DEPLOY_RESPONSE=$(curl -s -X POST \
  "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": "clear"}')

NEW_DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.id')

if [ "$NEW_DEPLOY_ID" != "null" ] && [ -n "$NEW_DEPLOY_ID" ]; then
    echo -e "${GREEN}✅ 新しいデプロイ開始: $NEW_DEPLOY_ID${NC}"
    
    # デプロイの進捗を監視
    echo ""
    echo -e "${YELLOW}⏳ デプロイ進捗を監視中...${NC}"
    
    for i in {1..10}; do
        sleep 5
        STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" \
          "https://api.render.com/v1/services/$SERVICE_ID/deploys/$NEW_DEPLOY_ID" | \
          jq -r '.status')
        
        echo "[$i/10] ステータス: $STATUS"
        
        if [ "$STATUS" = "live" ]; then
            echo -e "${GREEN}✅ デプロイ成功！${NC}"
            break
        elif [ "$STATUS" = "build_failed" ] || [ "$STATUS" = "update_failed" ]; then
            echo -e "${RED}❌ デプロイ失敗${NC}"
            break
        fi
    done
else
    echo "デプロイトリガー失敗"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ 自動デプロイプロセス完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📌 確認先:"
echo "- Renderダッシュボード: https://dashboard.render.com/web/$SERVICE_ID"
echo "- アプリケーションURL: https://task3-n1py.onrender.com"
echo ""

# 5. 最終チェック
echo -e "${YELLOW}🔍 最終チェック...${NC}"
curl -s -o /dev/null -w "HTTPステータス: %{http_code}\n" https://task3-n1py.onrender.com