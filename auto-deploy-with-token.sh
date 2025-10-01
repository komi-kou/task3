#!/bin/bash

echo "================================================"
echo "🚀 GitHub Access Token 自動デプロイ"
echo "================================================"
echo ""

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# GitHub Personal Access Tokenを環境変数から取得
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}GitHub Personal Access Tokenを入力してください${NC}"
    echo ""
    echo "トークン作成方法:"
    echo "1. https://github.com/settings/tokens/new を開く"
    echo "2. Note: task3-deploy"
    echo "3. Scopes: ☑️ repo にチェック"
    echo "4. Generate token をクリック"
    echo ""
    read -sp "Token (ghp_で始まる): " GITHUB_TOKEN
    echo ""
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ トークンが設定されていません"
    exit 1
fi

echo -e "${GREEN}✅ トークン確認完了${NC}"
echo ""

# ディレクトリ移動
cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"

# GitHubにプッシュ
echo -e "${BLUE}📤 GitHubに自動プッシュ中...${NC}"

git push -f "https://komi-kou:${GITHUB_TOKEN}@github.com/komi-kou/task3.git" main 2>&1 | while read line; do
    # 認証情報を含む行をフィルタリング
    if [[ ! "$line" =~ "remote:" ]]; then
        echo "$line"
    fi
done

# プッシュの成功確認
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ GitHubプッシュ成功！${NC}"
    echo ""
    
    # Render APIキー
    API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
    SERVICE_ID="srv-d3duljemcj7s73abbi50"
    
    echo -e "${BLUE}🚀 Renderデプロイ状況を監視中...${NC}"
    echo ""
    
    # 10秒待機（GitHubのwebhookが発火するまで）
    sleep 10
    
    # デプロイ状況を監視
    for i in {1..30}; do
        # 最新のデプロイ情報を取得
        DEPLOY_INFO=$(curl -s -H "Authorization: Bearer $API_KEY" \
            "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
            jq -r '.[0].deploy')
        
        STATUS=$(echo "$DEPLOY_INFO" | jq -r '.status')
        COMMIT=$(echo "$DEPLOY_INFO" | jq -r '.commit.message // "N/A"')
        CREATED=$(echo "$DEPLOY_INFO" | jq -r '.createdAt')
        
        # 進捗バー表示
        PROGRESS=$((i * 100 / 30))
        printf "\r[%-30s] %d%% " "$(printf '#%.0s' $(seq 1 $i))" "$PROGRESS"
        printf "Status: %-20s" "$STATUS"
        
        if [ "$STATUS" = "live" ]; then
            echo ""
            echo ""
            echo -e "${GREEN}================================================"
            echo "🎉 デプロイ完了！"
            echo "================================================${NC}"
            echo ""
            echo "📱 アプリケーション情報:"
            echo "   URL: https://task3-n1py.onrender.com"
            echo "   Status: $STATUS"
            echo "   Commit: $COMMIT"
            echo "   Time: $CREATED"
            echo ""
            echo "📊 Renderダッシュボード:"
            echo "   https://dashboard.render.com/web/$SERVICE_ID"
            echo ""
            
            # アプリケーションの動作確認
            echo "🔍 アプリケーション動作テスト..."
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://task3-n1py.onrender.com)
            
            if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ]; then
                echo -e "${GREEN}✅ アプリケーションは正常に動作しています！ (HTTP $HTTP_STATUS)${NC}"
            else
                echo -e "${YELLOW}⚠️  HTTPステータス: $HTTP_STATUS${NC}"
            fi
            
            # トークンを環境変数として保存する提案
            echo ""
            echo -e "${BLUE}💡 ヒント: 次回のために環境変数を設定:${NC}"
            echo "   export GITHUB_TOKEN='$GITHUB_TOKEN'"
            echo ""
            
            exit 0
            
        elif [ "$STATUS" = "build_failed" ] || [ "$STATUS" = "update_failed" ]; then
            echo ""
            echo ""
            echo -e "${YELLOW}❌ デプロイ失敗: $STATUS${NC}"
            echo ""
            echo "エラーログ確認:"
            echo "https://dashboard.render.com/web/$SERVICE_ID"
            exit 1
        fi
        
        # 10秒待機
        sleep 10
    done
    
    echo ""
    echo -e "${YELLOW}⏱️ デプロイがまだ進行中です${NC}"
    echo "確認: https://dashboard.render.com/web/$SERVICE_ID"
    
else
    echo ""
    echo "❌ GitHubプッシュ失敗"
    echo ""
    echo "以下を確認してください:"
    echo "1. トークンが正しいか"
    echo "2. トークンに 'repo' スコープがあるか"
    echo "3. リポジトリへのアクセス権があるか"
    exit 1
fi