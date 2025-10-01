# Vercelデプロイ手順

## 1. データベースの準備（必須）
VercelはSQLiteをサポートしていないため、PostgreSQLに変更が必要です。

### オプション1: Vercel Postgres（推奨・無料枠あり）
1. Vercelダッシュボード → Storage → Create Database
2. Postgresを選択
3. 接続情報をコピー

### オプション2: Supabase（無料）
1. https://supabase.com でアカウント作成
2. 新規プロジェクト作成
3. Settings → Database → Connection stringをコピー

### オプション3: Neon（無料）
1. https://neon.tech でアカウント作成
2. 新規データベース作成
3. 接続文字列をコピー

## 2. Prismaスキーマの更新
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // sqliteから変更
  url      = env("DATABASE_URL")
}
```

## 3. 環境変数の設定（Vercel）
Vercelダッシュボードで以下を設定：
- `DATABASE_URL`: PostgreSQL接続文字列
- `NEXTAUTH_SECRET`: ランダムな文字列（openssl rand -base64 32で生成）
- `NEXTAUTH_URL`: https://your-app-name.vercel.app

## 4. デプロイ
```bash
# GitHubにプッシュ
git add .
git commit -m "Setup for Vercel deployment"
git push

# Vercelでインポート
1. https://vercel.com/new
2. GitHubリポジトリを選択
3. 環境変数を設定
4. Deploy
```

## トラブルシューティング

### ビルドエラーの場合
- Turbopackを無効化済み
- postinstallスクリプトでPrisma生成を自動化

### データベース接続エラー
- DATABASE_URLが正しく設定されているか確認
- ?sslmode=requireが含まれているか確認