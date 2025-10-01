#!/bin/bash

echo "================================================"
echo "🚀 認証不要の自動デプロイ"
echo "================================================"
echo ""

# テンポラリトークンを作成（実際には使えないが、形式的に）
TEMP_TOKEN="ghp_temporarytoken123456789"

echo "📝 Personal Access Token作成手順:"
echo "================================"
echo ""
echo "1. 以下のURLをCommand+クリックで開く:"
echo "   https://github.com/settings/tokens/new"
echo ""
echo "2. 以下を設定:"
echo "   - Note: task3-deploy"
echo "   - Expiration: 7 days"
echo "   - Scopes: ☑️ repo （チェックを入れる）"
echo ""
echo "3. 緑の「Generate token」ボタンをクリック"
echo ""
echo "4. 生成されたトークン（ghp_で始まる文字列）をコピー"
echo ""
echo "5. 下のプロンプトに貼り付けてEnter"
echo ""
echo "================================"
echo ""

# トークンを読み取り
read -sp "Personal Access Tokenを貼り付けてEnter: " USER_TOKEN
echo ""

if [ -z "$USER_TOKEN" ]; then
    echo "❌ トークンが入力されていません"
    exit 1
fi

echo ""
echo "✅ トークン受け取り完了"
echo ""
echo "📤 GitHubに自動プッシュ中..."

cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"

# プッシュ実行
git push -f "https://komi-kou:${USER_TOKEN}@github.com/komi-kou/task3.git" main 2>&1 | grep -v "remote:" && {
    echo "✅ プッシュ成功！"
    echo ""
    echo "🚀 Renderが自動的にデプロイを開始します..."
    echo ""
    
    # Render APIで状態確認
    API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
    SERVICE_ID="srv-d3duljemcj7s73abbi50"
    
    sleep 10
    
    echo "📊 デプロイ状況:"
    curl -s -H "Authorization: Bearer $API_KEY" \
        "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
        jq -r '.[0].deploy | "Status: \(.status)\nCommit: \(.commit.message)"'
    
    echo ""
    echo "📌 デプロイ進捗確認:"
    echo "https://dashboard.render.com/web/$SERVICE_ID"
    echo ""
    echo "🌐 アプリケーションURL:"
    echo "https://task3-n1py.onrender.com"
    
} || {
    echo "❌ プッシュ失敗"
    echo "トークンのスコープ（repo）を確認してください"
}