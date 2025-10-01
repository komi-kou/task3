#!/bin/bash

echo "🔄 GitHub認証確認とプッシュ..."

# 認証状態を確認
if gh auth status >/dev/null 2>&1; then
    echo "✅ GitHub認証確認OK"
    
    # Gitの認証ヘルパーを設定
    gh auth setup-git
    
    # プッシュ実行
    echo "📤 GitHubにプッシュ中..."
    cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"
    
    git push -f origin main && {
        echo "✅ プッシュ成功！"
        echo ""
        echo "🚀 Renderで自動デプロイが開始されます..."
        
        # Render APIで最新のデプロイ状態を確認
        API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
        SERVICE_ID="srv-d3duljemcj7s73abbi50"
        
        echo "📊 デプロイ状態を確認中..."
        sleep 5
        
        curl -s -H "Authorization: Bearer $API_KEY" \
            "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
            jq '.[0] | {id: .deploy.id, status: .deploy.status}'
        
        echo ""
        echo "📌 Renderダッシュボード:"
        echo "https://dashboard.render.com/web/$SERVICE_ID"
    } || {
        echo "❌ プッシュ失敗。認証を確認してください。"
        gh auth status
    }
else
    echo "⏳ GitHub認証待機中..."
    echo "ブラウザで認証を完了してください:"
    echo "1. https://github.com/login/device"
    echo "2. コード: 2797-5DE7"
fi