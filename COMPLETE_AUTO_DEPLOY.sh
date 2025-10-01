#!/bin/bash

echo "=================================="
echo "🚀 完全自動デプロイシステム"
echo "=================================="
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"

echo -e "${YELLOW}ステップ1: ローカル環境の準備${NC}"
echo "======================================="
cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"

# 修正済みファイルの確認
echo "✅ 修正済みファイル:"
echo "  - app/layout.tsx (import paths fixed)"
echo "  - prisma/schema.production.prisma (PostgreSQL)"
echo "  - package.json (build scripts updated)"
echo "  - render.yaml (deployment config)"
echo ""

echo -e "${YELLOW}ステップ2: GitHub認証の自動化試行${NC}"
echo "======================================="

# 方法1: GitHub CLIのヘッドレス認証
echo "🔐 認証方法1: GitHub CLI..."
if command -v gh &> /dev/null; then
    # 既存の認証をチェック
    if gh auth status &>/dev/null; then
        echo -e "${GREEN}✅ GitHub CLI認証済み！${NC}"
        echo "📤 プッシュを実行中..."
        gh auth setup-git
        git push -f origin main && {
            echo -e "${GREEN}✅ GitHubへのプッシュ成功！${NC}"
            PUSH_SUCCESS=true
        } || {
            echo -e "${RED}❌ プッシュ失敗${NC}"
            PUSH_SUCCESS=false
        }
    else
        echo "⏳ GitHub CLI認証が必要です"
        # デバイスコード認証を開始
        gh auth login --hostname github.com --git-protocol https --skip-ssh-key &
        AUTH_PID=$!
        
        echo "認証プロセスID: $AUTH_PID"
        echo ""
        echo -e "${YELLOW}ブラウザで認証してください:${NC}"
        echo "1. https://github.com/login/device"
        echo "2. 表示されたコードを入力"
        echo ""
        
        # 30秒待機
        for i in {1..6}; do
            sleep 5
            if gh auth status &>/dev/null; then
                echo -e "${GREEN}✅ 認証成功！${NC}"
                kill $AUTH_PID 2>/dev/null
                gh auth setup-git
                git push -f origin main && PUSH_SUCCESS=true || PUSH_SUCCESS=false
                break
            fi
            echo "[$i/6] 認証待機中..."
        done
        kill $AUTH_PID 2>/dev/null
    fi
else
    echo "GitHub CLIがインストールされていません"
fi

echo ""
echo -e "${YELLOW}ステップ3: Renderでの自動デプロイ${NC}"
echo "======================================="

# Renderの環境変数を設定
echo "🔧 環境変数の自動設定..."
curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/env-vars/bulk" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '[
        {"key": "DATABASE_URL", "value": "postgresql://task3_user:Gp27IepB2fRzxbacJnlJMc8FcE5EoOvy@dpg-crs5h2lds78s73b9e7ig-a.oregon-postgres.render.com/task3_db"},
        {"key": "NEXTAUTH_SECRET", "value": "your-secret-key-here-change-in-production"},
        {"key": "NEXTAUTH_URL", "value": "https://task3-n1py.onrender.com"},
        {"key": "NODE_ENV", "value": "production"}
    ]' > /dev/null 2>&1

echo -e "${GREEN}✅ 環境変数設定完了${NC}"

# デプロイをトリガー
echo ""
echo "🚀 Renderデプロイをトリガー..."
DEPLOY_RESPONSE=$(curl -s -X POST \
    "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"clearCache": "clear"}')

DEPLOY_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ "$DEPLOY_ID" != "null" ] && [ -n "$DEPLOY_ID" ]; then
    echo -e "${GREEN}✅ デプロイ開始: $DEPLOY_ID${NC}"
    echo ""
    echo "📊 デプロイ進捗:"
    
    # 進捗バー表示
    for i in {1..20}; do
        sleep 10
        STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" \
            "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID" | \
            jq -r '.status' 2>/dev/null)
        
        # プログレスバー
        PROGRESS=$((i * 5))
        printf "\r["
        printf "%-20s" "$(printf '#%.0s' $(seq 1 $((i))))"
        printf "] $PROGRESS%% - Status: $STATUS"
        
        if [ "$STATUS" = "live" ]; then
            echo ""
            echo ""
            echo -e "${GREEN}=================================="
            echo "🎉 デプロイ成功！"
            echo "=================================="
            echo ""
            echo "📱 アプリケーションURL:"
            echo "   https://task3-n1py.onrender.com"
            echo ""
            echo "📊 Renderダッシュボード:"
            echo "   https://dashboard.render.com/web/$SERVICE_ID"
            echo "==================================${NC}"
            exit 0
            
        elif [ "$STATUS" = "build_failed" ]; then
            echo ""
            echo -e "${RED}❌ ビルド失敗${NC}"
            break
        fi
    done
fi

echo ""
echo -e "${YELLOW}=================================="
echo "📝 自動化の現在の状況:"
echo "==================================${NC}"

if [ "$PUSH_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ GitHubへのプッシュ: 成功${NC}"
    echo "   Renderが自動的に新しいコードをデプロイします"
else
    echo -e "${RED}❌ GitHubへのプッシュ: 要手動対応${NC}"
    echo ""
    echo "以下のいずれかの方法でプッシュしてください:"
    echo ""
    echo "1️⃣ Personal Access Token:"
    echo "   git push https://USERNAME:TOKEN@github.com/komi-kou/task3.git main"
    echo ""
    echo "2️⃣ GitHub CLI:"
    echo "   gh auth login"
    echo "   git push origin main"
fi

echo ""
echo "📌 次のステップ:"
echo "1. GitHubにコードをプッシュ（未完了の場合）"
echo "2. Renderが自動的にデプロイを開始"
echo "3. https://task3-n1py.onrender.com でアプリケーションを確認"