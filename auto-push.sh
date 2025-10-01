#!/bin/bash

echo "🔄 GitHub認証確認と自動プッシュ..."
echo ""

# 認証が完了するまで待機（最大30秒）
for i in {1..10}; do
    if gh auth status >/dev/null 2>&1; then
        echo "✅ GitHub認証成功！"
        
        # Git認証ヘルパーを設定
        echo "📝 Git認証設定中..."
        gh auth setup-git
        
        # リポジトリディレクトリに移動
        cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"
        
        # リモートURLを確認
        echo "🔗 リモートURL確認..."
        git remote set-url origin https://github.com/komi-kou/task3.git
        
        # プッシュ実行
        echo "📤 GitHubにプッシュ中..."
        git push -f origin main && {
            echo "✅ プッシュ成功！"
            echo ""
            echo "🚀 Renderで自動デプロイが開始されます..."
            
            # Render APIで再デプロイ
            API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
            SERVICE_ID="srv-d3duljemcj7s73abbi50"
            
            echo "🔄 Renderで再デプロイをトリガー..."
            DEPLOY=$(curl -s -X POST \
                "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
                -H "Authorization: Bearer $API_KEY" \
                -H "Content-Type: application/json" \
                -d '{"clearCache": "clear"}')
            
            DEPLOY_ID=$(echo "$DEPLOY" | jq -r '.id')
            
            if [ "$DEPLOY_ID" != "null" ]; then
                echo "✅ デプロイ開始: $DEPLOY_ID"
                echo ""
                echo "📊 デプロイ進捗:"
                
                # 進捗を監視
                for j in {1..20}; do
                    sleep 5
                    STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" \
                        "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID" | \
                        jq -r '.status')
                    
                    echo "[$j/20] ステータス: $STATUS"
                    
                    if [ "$STATUS" = "live" ]; then
                        echo ""
                        echo "🎉 デプロイ成功！"
                        echo "🌐 URL: https://task3-n1py.onrender.com"
                        break
                    elif [ "$STATUS" = "build_failed" ]; then
                        echo "❌ ビルド失敗"
                        break
                    fi
                done
            fi
            
            echo ""
            echo "📌 Renderダッシュボード:"
            echo "https://dashboard.render.com/web/$SERVICE_ID"
            
        } || {
            echo "❌ プッシュ失敗"
            echo "エラー詳細:"
            git push origin main
        }
        
        exit 0
    else
        echo "[$i/10] 認証待機中... (3秒後に再試行)"
        sleep 3
    fi
done

echo "❌ 認証タイムアウト"
echo "手動で以下を実行してください:"
echo "1. https://github.com/login/device"
echo "2. コード: 65D6-E576"
echo "3. 認証後、このスクリプトを再実行"