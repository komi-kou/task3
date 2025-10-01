# 📦 デプロイ必要ファイルチェックリスト

## ✅ デプロイに必要なファイル・フォルダ

### 🔴 必須ファイル（これらは必ずデプロイ）
```
✓ /app/              （アプリケーション全体）
✓ /components/       （UIコンポーネント）
✓ /lib/              （ユーティリティ）
✓ /prisma/           （データベーススキーマ）
  - schema.prisma
  - schema.production.prisma
✓ /public/           （静的ファイル）
✓ /types/            （型定義）
✓ package.json       （依存関係）
✓ package-lock.json  （依存関係ロック）
✓ next.config.mjs    （Next.js設定）
✓ tsconfig.json      （TypeScript設定）
✓ tailwind.config.js （Tailwind設定）
✓ postcss.config.mjs （PostCSS設定）
✓ middleware.ts      （認証ミドルウェア）
✓ vercel.json        （Vercelデプロイ設定）
✓ .gitignore         （Git除外設定）
```

### 🟡 オプションファイル（あると良い）
```
○ AUTO_DEPLOY_GUIDE.md     （デプロイガイド）
○ .env.production.example  （環境変数テンプレート）
```

### 🔵 不要なファイル（デプロイしない）
```
✗ /node_modules/     （自動生成される）
✗ /.next/            （ビルド時に生成）
✗ /prisma/dev.db     （ローカルデータベース）
✗ .env               （ローカル環境変数）
✗ .env.local         （ローカル環境変数）
✗ deploy.sh          （ローカル実行用）
✗ tsconfig.tsbuildinfo
✗ 各種ガイドファイル（.md）
```

## 🚀 デプロイ手順

### 方法1: GitHub経由（推奨）

1. **GitHubリポジトリを作成**
   ```bash
   # 初期化（まだの場合）
   git init
   
   # .gitignoreが適用されているか確認
   git status
   
   # すべての必要ファイルを追加
   git add .
   
   # コミット
   git commit -m "Ready for deployment"
   
   # GitHubにプッシュ
   git remote add origin https://github.com/YOUR_USERNAME/crm-task-manager.git
   git push -u origin main
   ```

2. **Vercelでデプロイ**
   - https://vercel.com にアクセス
   - 「Add New」→「Project」
   - GitHubリポジトリを選択
   - 環境変数を設定（下記参照）
   - 「Deploy」をクリック

### 方法2: Vercel CLI（直接デプロイ）

1. **Vercel CLIをインストール**
   ```bash
   npm i -g vercel
   ```

2. **デプロイ実行**
   ```bash
   vercel
   ```
   
3. **プロンプトに従って設定**
   - プロジェクト名を入力
   - 環境変数を設定

## 🔐 環境変数の設定

Vercelで以下の環境変数を設定：

```env
# Supabaseから取得
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# ランダム生成（openssl rand -base64 32）
NEXTAUTH_SECRET=your-secret-here

# デプロイ後のURL
NEXTAUTH_URL=https://your-app.vercel.app
```

## 📋 デプロイ前チェックリスト

- [ ] 不要なファイルが.gitignoreに含まれているか確認
- [ ] package.jsonのビルドスクリプトが正しいか確認
- [ ] Prismaスキーマが本番用に設定されているか確認
- [ ] 環境変数の準備ができているか確認
- [ ] Supabaseデータベースが作成されているか確認

## 🎯 クイックスタート

最速でデプロイする場合：

```bash
# 1. 必要なファイルだけをステージング
git add app/ components/ lib/ prisma/ public/ types/ \
  package*.json *.config.* tsconfig.json middleware.ts \
  vercel.json .gitignore

# 2. コミット
git commit -m "Initial deployment"

# 3. GitHubにプッシュ
git push origin main

# 4. Vercelでインポート
# → https://vercel.com/new
```

## ⚠️ 注意事項

1. **データベース**: 本番環境ではPostgreSQLを使用（Supabase推奨）
2. **秘密情報**: .envファイルは絶対にコミットしない
3. **ビルド**: `prisma generate`が必ず実行されるように設定
4. **URL**: NEXTAUTH_URLはデプロイ後に正しいURLに更新

これらのファイルをデプロイすれば、アプリケーションが正常に動作します！