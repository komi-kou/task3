#!/bin/bash

API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"
DEPLOY_ID="dep-d3eflcili9vc739lhc00"

echo "📜 Renderビルドログを取得中..."
echo ""

# デプロイログを取得
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID" | \
  jq -r '.logs[]' | head -100

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "エラーパターンを検索中..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# エラーログだけを抽出
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID" | \
  jq -r '.logs[]' | grep -i "error\|failed\|cannot\|module not found" | head -20