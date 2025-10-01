#!/bin/bash

API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"  # task3

echo "🔍 Renderデプロイの詳細分析"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. サービス設定を確認
echo "📋 サービス設定:"
SERVICE=$(curl -s -H "Authorization: Bearer $API_KEY" "https://api.render.com/v1/services/$SERVICE_ID")
echo "- 名前: $(echo "$SERVICE" | jq -r '.name')"
echo "- リポジトリ: $(echo "$SERVICE" | jq -r '.repo')"
echo "- ブランチ: $(echo "$SERVICE" | jq -r '.branch')"
echo "- ビルドコマンド: $(echo "$SERVICE" | jq -r '.serviceDetails.envSpecificDetails.buildCommand')"
echo "- 開始コマンド: $(echo "$SERVICE" | jq -r '.serviceDetails.envSpecificDetails.startCommand')"
echo ""

# 2. 環境変数を確認
echo "🔐 環境変数:"
ENV_VARS=$(curl -s -H "Authorization: Bearer $API_KEY" "https://api.render.com/v1/services/$SERVICE_ID/env-vars")
echo "$ENV_VARS" | jq -r '.[] | "- \(.envVar.key): [設定済み]"'
echo ""

# 3. 最新のデプロイを確認
echo "📦 最新のデプロイ:"
DEPLOYS=$(curl -s -H "Authorization: Bearer $API_KEY" "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=3")
echo "$DEPLOYS" | jq -r '.[] | "- ID: \(.deploy.id), ステータス: \(.deploy.status), 時刻: \(.deploy.createdAt)"'
echo ""

# 4. 推奨される修正
echo "💡 推奨される修正:"
echo "1. GitHubリポジトリに最新の修正をプッシュ:"
echo "   - app/layout.tsx のインポートパス修正"
echo "   - prisma/schema.production.prisma の追加"
echo "   - package.json のビルドスクリプト修正"
echo ""
echo "2. Renderで手動デプロイを実行"
echo "   https://dashboard.render.com/web/$SERVICE_ID"
echo ""

# 5. 問題の可能性
echo "⚠️ 考えられる問題:"
BUILD_CMD=$(echo "$SERVICE" | jq -r '.serviceDetails.envSpecificDetails.buildCommand')
if [[ ! "$BUILD_CMD" == *"schema.production.prisma"* ]]; then
    echo "❌ ビルドコマンドが古い可能性があります"
    echo "   現在: $BUILD_CMD"
    echo "   推奨: npm ci && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build"
fi

# DATABASE_URLチェック
if ! echo "$ENV_VARS" | jq -e '.[] | select(.envVar.key == "DATABASE_URL")' > /dev/null 2>&1; then
    echo "❌ DATABASE_URLが未設定"
fi

echo ""
echo "📌 次のアクション:"
echo "1. GitHubに修正済みコードをプッシュ"
echo "2. Renderダッシュボードで「Manual Deploy」"
echo "3. ビルドログでエラーを確認"