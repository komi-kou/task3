#!/bin/bash

echo "🚀 Render自動修正デプロイを開始..."
echo ""

API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"

# 現在のローカルファイルの状態を確認
echo "📁 ローカルファイルの確認..."
cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"

# 重要なファイルが存在することを確認
echo "✅ app/layout.tsx: $(grep -q "@/app/globals.css" app/layout.tsx && echo "修正済み" || echo "未修正")"
echo "✅ prisma/schema.prisma: $(grep -q "provider = \"sqlite\"" prisma/schema.prisma && echo "SQLite設定" || echo "PostgreSQL設定")"
echo "✅ prisma/schema.production.prisma: $(test -f prisma/schema.production.prisma && echo "存在" || echo "不在")"
echo ""

# Renderの環境変数を確認
echo "🔧 Render環境変数の確認..."
ENV_VARS=$(curl -s -H "Authorization: Bearer $API_KEY" \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars" | jq -r '.[] | "\(.key)=\(.value)"')

echo "$ENV_VARS" | grep DATABASE_URL > /dev/null || {
    echo "❌ DATABASE_URLが設定されていません"
    echo "設定中..."
    curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d '[{
            "key": "DATABASE_URL",
            "value": "postgresql://task3_user:Gp27IepB2fRzxbacJnlJMc8FcE5EoOvy@dpg-crs5h2lds78s73b9e7ig-a.oregon-postgres.render.com/task3_db"
        }]'
    echo "✅ DATABASE_URL設定完了"
}

echo ""
echo "📦 クリーンなデプロイをトリガー..."

# キャッシュをクリアして再デプロイ
DEPLOY_RESPONSE=$(curl -s -X POST \
    "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "clearCache": "clear"
    }')

DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.id')

if [ "$DEPLOY_ID" != "null" ] && [ -n "$DEPLOY_ID" ]; then
    echo "✅ デプロイ開始: $DEPLOY_ID"
    echo ""
    echo "📊 デプロイ進捗を監視中..."
    
    for i in {1..30}; do
        sleep 10
        
        STATUS_INFO=$(curl -s -H "Authorization: Bearer $API_KEY" \
            "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID")
        
        STATUS=$(echo "$STATUS_INFO" | jq -r '.status')
        
        echo "[$i/30] ステータス: $STATUS"
        
        if [ "$STATUS" = "live" ]; then
            echo ""
            echo "🎉 デプロイ成功！"
            echo "🌐 アプリケーションURL: https://task3-n1py.onrender.com"
            echo ""
            echo "📝 最終確認:"
            curl -s -o /dev/null -w "HTTPステータス: %{http_code}\n" https://task3-n1py.onrender.com
            exit 0
            
        elif [ "$STATUS" = "build_failed" ] || [ "$STATUS" = "update_failed" ]; then
            echo ""
            echo "❌ デプロイ失敗: $STATUS"
            echo ""
            echo "📋 エラーログ:"
            curl -s -H "Authorization: Bearer $API_KEY" \
                "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID/events?limit=10" | \
                jq -r '.[] | select(.message | contains("error") or contains("failed")) | .message'
            
            echo ""
            echo "🔍 最新のビルドログ:"
            curl -s -H "Authorization: Bearer $API_KEY" \
                "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
                jq -r '.[0].deploy | "Commit: \(.commit.message // "N/A")\nBranch: \(.branch // "N/A")"'
            exit 1
        fi
    done
    
    echo "⏱️ タイムアウト - デプロイがまだ進行中です"
    echo "📌 Renderダッシュボードで確認: https://dashboard.render.com/web/$SERVICE_ID"
else
    echo "❌ デプロイの開始に失敗しました"
    echo "Response: $DEPLOY_RESPONSE"
fi