#!/bin/bash

echo "🔄 GitHubへ直接プッシュを実行..."
echo ""

cd "/Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager 2"

# 現在の状態を確認
echo "📋 Git状態:"
git status --short
echo ""

# コミットがあるか確認
if git diff-index --quiet HEAD --; then
    echo "✅ 全ての変更はコミット済みです"
else
    echo "📝 変更をコミット中..."
    git add -A
    git commit -m "Update files for Render deployment fix"
fi

echo ""
echo "📤 プッシュ方法の選択:"
echo ""
echo "==================================="
echo "GitHub認証コード: B2C0-EECF"
echo "==================================="
echo ""
echo "1. ブラウザで https://github.com/login/device を開く"
echo "2. コード B2C0-EECF を入力"
echo "3. 認証を承認"
echo ""
echo "認証完了後、以下のコマンドを実行:"
echo ""
echo "gh auth status"
echo "gh auth setup-git"
echo "git push -f origin main"
echo ""
echo "または、Personal Access Tokenを使用:"
echo "git push https://YOUR_USERNAME:YOUR_TOKEN@github.com/komi-kou/task3.git main"