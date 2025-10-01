#!/bin/bash

echo "🔄 手動プッシュプロセスを開始..."
echo ""

# 現在の状態を確認
cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"

echo "📋 現在のGit状態:"
git status --short
echo ""

echo "📝 リモート設定:"
git remote -v
echo ""

# GitHubへのプッシュを試行
echo "🚀 GitHubへプッシュを試行中..."
echo ""

# HTTPSでプッシュ（ユーザー名とトークンが必要）
echo "方法1: Personal Access Tokenを使用"
echo "======================================="
echo "1. https://github.com/settings/tokens で新しいトークンを作成"
echo "2. 'repo' スコープを選択"
echo "3. Generate token をクリック"
echo "4. 以下のコマンドを実行:"
echo ""
echo "git remote set-url origin https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/komi-kou/task3.git"
echo "git push -f origin main"
echo ""
echo "または:"
echo ""
echo "方法2: GitHub CLIで再認証"
echo "========================="
echo "gh auth login"
echo "  → GitHub.com を選択"
echo "  → HTTPS を選択"
echo "  → Authenticate with a web browser を選択"
echo "  → ブラウザで認証"
echo ""
echo "認証後:"
echo "gh auth setup-git"
echo "git push -f origin main"
echo ""

# Renderの状態を確認
echo "📊 Renderの現在の状態:"
API_KEY="rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog"
SERVICE_ID="srv-d3duljemcj7s73abbi50"

LATEST=$(curl -s -H "Authorization: Bearer $API_KEY" \
    "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
    jq -r '.[0] | "ID: \(.deploy.id), Status: \(.deploy.status), Time: \(.deploy.createdAt)"')

echo "$LATEST"
echo ""
echo "📌 Renderダッシュボード:"
echo "https://dashboard.render.com/web/$SERVICE_ID"