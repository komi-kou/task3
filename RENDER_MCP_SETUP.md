# 🤖 Render MCP 自動デプロイガイド

## 📋 準備完了項目

✅ **APIキー設定済み**: `rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog`
✅ **MCP設定ファイル作成済み**: `.claude/claude_desktop_config.json`
✅ **デプロイスクリプト作成済み**: `deploy-to-render.sh`

## 🚀 方法1: MCP経由での自動デプロイ（Claude Desktop/Code）

### Claude DesktopまたはClaude Codeの場合：

1. **設定ファイルが自動読み込みされます**
   - `.claude/claude_desktop_config.json`が既に設定済み

2. **MCPコマンドを使用**
   ```
   以下のプロンプトを使用:
   - "Set my Render workspace to [YOUR_WORKSPACE]"
   - "Deploy crm-task-manager from GitHub"
   - "Create a PostgreSQL database for crm-task-manager"
   ```

## 🚀 方法2: Render API直接使用（推奨）

### ステップ1: GitHubリポジトリの準備
```bash
# リポジトリをプッシュ
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### ステップ2: デプロイスクリプトを編集
```bash
# deploy-to-render.sh を編集
# GITHUB_REPO を自分のリポジトリURLに変更:
GITHUB_REPO="https://github.com/YOUR_USERNAME/crm-task-manager"
```

### ステップ3: スクリプトを実行
```bash
./deploy-to-render.sh
```

## 🚀 方法3: Render CLIを使用

### インストールと設定
```bash
# Render CLIをインストール
npm install -g @render/cli

# ログイン（APIキーを使用）
render login --api-key rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog

# サービスを作成
render create web \
  --name crm-task-manager \
  --repo https://github.com/YOUR_USERNAME/crm-task-manager \
  --branch main \
  --build-command "npm ci && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build" \
  --start-command "npx prisma migrate deploy --schema=./prisma/schema.production.prisma && npm start"
```

## 🚀 方法4: cURLでAPI直接呼び出し

```bash
# データベース作成
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "postgres",
    "name": "crm-db",
    "plan": "free",
    "region": "oregon"
  }'

# Webサービス作成
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "crm-task-manager",
    "repo": "https://github.com/YOUR_USERNAME/crm-task-manager",
    "branch": "main",
    "plan": "free",
    "buildCommand": "npm ci && npx prisma generate --schema=./prisma/schema.production.prisma && npm run build",
    "startCommand": "npx prisma migrate deploy --schema=./prisma/schema.production.prisma && npm start"
  }'
```

## 🔐 環境変数の自動設定

デプロイ時に以下が自動設定されます：
- `DATABASE_URL` - PostgreSQL接続文字列
- `NEXTAUTH_SECRET` - セッション暗号化キー
- `NEXTAUTH_URL` - アプリケーションURL
- `NODE_ENV` - production

## 📊 デプロイ状態の確認

### API経由で確認
```bash
curl -H "Authorization: Bearer rnd_Kn3ARDuhww3ALGxrSA6QmFzpNuog" \
  https://api.render.com/v1/services
```

### ダッシュボードで確認
https://dashboard.render.com/

## ⚠️ 注意事項

1. **GitHubリポジトリ**: publicまたはRenderがアクセス可能である必要があります
2. **無料プラン制限**: 
   - 15分間アクセスがないとスリープ
   - 月750時間の稼働制限
3. **APIキー管理**: 本番環境では環境変数として管理してください

## 🎯 最速デプロイ手順

```bash
# 1. GitHubにプッシュ
git push origin main

# 2. スクリプトを編集（GitHubのURLを設定）
nano deploy-to-render.sh

# 3. 実行
./deploy-to-render.sh

# 4. 完了！
```

## 🆘 トラブルシューティング

### "Unauthorized"エラー
→ APIキーを確認してください

### "Repository not found"
→ GitHubリポジトリがpublicまたはRenderに接続されているか確認

### ビルドエラー
→ ログを確認: `curl -H "Authorization: Bearer YOUR_KEY" https://api.render.com/v1/services/SERVICE_ID/logs`