#!/bin/bash

echo "================================================"
echo "🚨 最終手段: 完全自動デプロイシステム"
echo "================================================"
echo ""

# 色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Gitの認証情報を環境変数から設定
export GIT_ASKPASS=/bin/echo

echo -e "${YELLOW}ステップ1: macOSキーチェーンを使用した認証${NC}"
echo "================================================"

# macOSのキーチェーンを使用
git config --global credential.helper osxkeychain

# セキュリティコマンドでGitHub認証情報を追加
echo -e "${YELLOW}GitHubアカウント情報を入力してください:${NC}"
echo ""
echo "以下の情報が必要です:"
echo "1. GitHubユーザー名: komi-kou"
echo "2. Personal Access Token（パスワードの代わり）"
echo ""
echo "Personal Access Tokenの作成:"
echo "1. https://github.com/settings/tokens/new を開く"
echo "2. 'repo' スコープを選択"
echo "3. Generate token をクリック"
echo "4. トークンをコピー"
echo ""
read -p "GitHubユーザー名を入力 (デフォルト: komi-kou): " GITHUB_USER
GITHUB_USER=${GITHUB_USER:-komi-kou}

read -sp "Personal Access Tokenを入力: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ トークンが入力されていません${NC}"
    echo ""
    echo "代替方法: SSH認証を使用"
    echo "========================"
    
    # SSHキーが存在するか確認
    if [ -f ~/.ssh/id_ed25519.pub ]; then
        echo -e "${GREEN}✅ SSHキー発見${NC}"
        echo ""
        echo "公開鍵:"
        cat ~/.ssh/id_ed25519.pub
        echo ""
        echo "この公開鍵を以下に追加:"
        echo "https://github.com/settings/ssh/new"
        echo ""
        echo "追加後、以下を実行:"
        echo "git remote set-url origin git@github.com:komi-kou/task3.git"
        echo "git push -f origin main"
    else
        echo "SSHキー生成中..."
        ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -C "$GITHUB_USER@auto-deploy"
        echo -e "${GREEN}✅ SSHキー生成完了${NC}"
        echo ""
        echo "公開鍵:"
        cat ~/.ssh/id_ed25519.pub
        echo ""
        echo "この公開鍵をGitHubに追加してください:"
        echo "https://github.com/settings/ssh/new"
    fi
    exit 1
fi

echo ""
echo -e "${YELLOW}ステップ2: 認証情報でプッシュ${NC}"
echo "================================================"

cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"

# HTTPSでプッシュ
git remote set-url origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/komi-kou/task3.git"

echo "📤 GitHubにプッシュ中..."
git push -f origin main && {
    echo -e "${GREEN}✅ GitHubプッシュ成功！${NC}"
    
    # リモートURLから認証情報を削除
    git remote set-url origin https://github.com/komi-kou/task3.git
    
    echo ""
    echo -e "${YELLOW}ステップ3: Renderデプロイ監視${NC}"
    echo "================================================"
    
    API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
    SERVICE_ID="srv-d3duljemcj7s73abbi50"
    
    # 少し待機（GitHubのwebhookが発火するまで）
    sleep 5
    
    # 最新のデプロイを確認
    echo "📊 最新のデプロイ状況を確認中..."
    
    for i in {1..30}; do
        LATEST_DEPLOY=$(curl -s -H "Authorization: Bearer $API_KEY" \
            "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
            jq -r '.[0]')
        
        STATUS=$(echo "$LATEST_DEPLOY" | jq -r '.deploy.status')
        COMMIT=$(echo "$LATEST_DEPLOY" | jq -r '.deploy.commit.message // "N/A"')
        
        echo "[$i/30] Status: $STATUS | Commit: $COMMIT"
        
        if [ "$STATUS" = "live" ]; then
            echo ""
            echo -e "${GREEN}================================================"
            echo "🎉 デプロイ成功！"
            echo "================================================"
            echo ""
            echo "📱 アプリケーションURL:"
            echo "   https://task3-n1py.onrender.com"
            echo ""
            echo "📊 Renderダッシュボード:"
            echo "   https://dashboard.render.com/web/$SERVICE_ID"
            echo "================================================${NC}"
            
            # アプリケーションの動作確認
            echo ""
            echo "🔍 アプリケーション動作確認..."
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://task3-n1py.onrender.com)
            if [ "$HTTP_STATUS" = "200" ]; then
                echo -e "${GREEN}✅ アプリケーションは正常に動作しています！${NC}"
            else
                echo -e "${YELLOW}⚠️ HTTPステータス: $HTTP_STATUS${NC}"
            fi
            
            exit 0
        elif [ "$STATUS" = "build_failed" ]; then
            echo -e "${RED}❌ ビルド失敗${NC}"
            echo "エラーログを確認してください:"
            echo "https://dashboard.render.com/web/$SERVICE_ID"
            exit 1
        fi
        
        sleep 10
    done
    
} || {
    echo -e "${RED}❌ GitHubプッシュ失敗${NC}"
    echo ""
    echo "エラー内容:"
    git push origin main 2>&1
    echo ""
    echo "トークンが正しいか確認してください。"
    echo "必要なスコープ: repo"
}