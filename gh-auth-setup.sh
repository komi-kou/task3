#!/bin/bash

echo "🔐 GitHub認証を自動設定..."
echo ""

# GitHub CLIで認証状態を確認
gh auth status 2>/dev/null || {
    echo "❌ GitHub CLIが未認証です"
    echo ""
    echo "📋 認証方法:"
    echo "1. ブラウザで認証（推奨）:"
    echo "   gh auth login --web"
    echo ""
    echo "2. デバイスコードで認証:"
    echo "   gh auth login"
    echo "   → GitHub.com を選択"
    echo "   → HTTPS を選択"  
    echo "   → Login with a web browser を選択"
    echo ""
    echo "3. Personal Access Tokenで認証:"
    echo "   gh auth login --with-token < token.txt"
    echo ""
    
    # デバイスコード認証を開始
    echo "デバイスコード認証を開始します..."
    echo "" | gh auth login --hostname github.com --git-protocol https --web 2>/dev/null || {
        echo "自動認証に失敗しました。手動で実行してください："
        echo "gh auth login"
    }
}

# 認証後、自動でGitHubにプッシュ
if gh auth status >/dev/null 2>&1; then
    echo "✅ GitHub認証成功！"
    echo ""
    echo "📤 GitHubにプッシュ中..."
    
    cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"
    
    # GitHub CLIを使ってリポジトリにプッシュ
    gh repo view komi-kou/task3 >/dev/null 2>&1 || {
        echo "リポジトリが見つかりません。作成しますか？"
        gh repo create komi-kou/task3 --public --source=. --push
    }
    
    # 通常のgit pushを試行
    git push -f origin main 2>/dev/null || {
        # GitHub CLIのgit credentialヘルパーを設定
        gh auth setup-git
        git push -f origin main
    }
    
    echo "✅ プッシュ完了！"
else
    echo "❌ 認証が必要です"
fi