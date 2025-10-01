#!/bin/bash

echo "🔧 Render環境変数を設定中..."

API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"

# 環境変数を設定
echo "DATABASE_URL設定中..."
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "DATABASE_URL",
    "value": "postgresql://task3_user:Gp27IepB2fRzxbacJnlJMc8FcE5EoOvy@dpg-crs5h2lds78s73b9e7ig-a.oregon-postgres.render.com/task3_db"
  }' 2>/dev/null

echo "NEXTAUTH_SECRET設定中..."
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXTAUTH_SECRET",
    "value": "supersecretkey123456789"
  }' 2>/dev/null

echo "NEXTAUTH_URL設定中..."
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXTAUTH_URL",
    "value": "https://task3-n1py.onrender.com"
  }' 2>/dev/null

echo ""
echo "✅ 環境変数設定完了"
echo ""

# 確認
echo "📋 設定された環境変数:"
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://api.render.com/v1/services/$SERVICE_ID/env-vars" | \
  jq -r '.[] | "\(.key)"' 2>/dev/null || echo "環境変数取得エラー"