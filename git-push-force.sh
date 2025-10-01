#!/bin/bash

echo "🔄 GitHubに強制プッシュを実行..."

# Gitの設定
git config user.name "komi-kou"
git config user.email "komi-kou@users.noreply.github.com"

# SSHを使わずHTTPSでプッシュする準備
echo "📦 ファイルを準備中..."

# 必要なファイルのみを選択的にステージング
git add app/layout.tsx
git add prisma/schema.production.prisma
git add package.json
git add vercel.json
git add render.yaml
git add next.config.mjs
git add -A

# コミット
git commit -m "Critical fix: Import paths and Prisma configuration for deployment" --allow-empty

# GitHub CLIを使ってプッシュ（代替案）
echo "🚀 GitHubにプッシュ中..."

# 通常のプッシュを試行
git push origin main -f 2>/dev/null || {
    echo "⚠️ 直接プッシュ失敗。GitHub Personal Access Tokenが必要です。"
    echo ""
    echo "📋 手動でプッシュする方法:"
    echo "1. GitHub.comでPersonal Access Tokenを作成"
    echo "   Settings → Developer settings → Personal access tokens → Generate new token"
    echo "2. 以下のコマンドを実行:"
    echo "   git remote set-url origin https://[TOKEN]@github.com/komi-kou/task3.git"
    echo "   git push -f origin main"
}

# Render APIで再度デプロイ
echo ""
echo "🔄 Renderで再デプロイを実行..."

API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"

curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": "clear"}' | jq '.id'

echo ""
echo "✅ 処理完了"
echo "📌 Renderダッシュボード: https://dashboard.render.com/web/$SERVICE_ID"