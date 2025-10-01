# Vercel デプロイメントガイド

## ✅ 修正完了内容

以下の修正を実施しました：

1. **app/globals.css** - Tailwind CSSの基本設定を追加
2. **app/providers.tsx** - クライアントコンポーネントとして作成
3. **app/layout.tsx** - インポートパスを統一（小文字）
4. **package.json** - スクリプトを安定版に整理
5. **Git設定** - 大文字小文字を区別する設定に変更

## 🚀 Vercelでのデプロイ手順

### 1. GitHubへのプッシュ
```bash
git push --set-upstream origin main
```

### 2. Vercelでの設定

#### Build Settings
- **Framework Preset**: Next.js（自動検出）
- **Build Command**: 
  ```bash
  npx prisma generate && npx prisma migrate deploy && next build
  ```
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

#### Environment Variables（環境変数）

以下の環境変数をVercelのプロジェクト設定で追加：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | Neon PostgreSQLのPooled接続URL | `postgresql://user:pass@host/db?sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | Neon PostgreSQLのDirect接続URL（Migration用） | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | NextAuth認証用のシークレットキー | ランダムな32文字以上の文字列 |
| `NEXTAUTH_URL` | 本番環境のURL（デプロイ後に設定） | `https://your-app.vercel.app` |

### 3. Neon PostgreSQLの設定

1. [Neon](https://neon.tech)でアカウント作成
2. 新しいプロジェクトを作成
3. 接続文字列を取得：
   - **Pooled connection string** → `DATABASE_URL`
   - **Direct connection string** → `DIRECT_URL`

### 4. NEXTAUTH_SECRETの生成

ターミナルで以下を実行：
```bash
openssl rand -base64 32
```

### 5. デプロイ手順

1. Vercelにログイン
2. "Import Git Repository"をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定
5. "Deploy"をクリック

### 6. デプロイ後の設定

1. デプロイ完了後、生成されたURLをコピー
2. Vercelの環境変数設定で`NEXTAUTH_URL`を更新
3. 再デプロイを実行

## 🔧 トラブルシューティング

### ビルドエラーが発生する場合

1. **Module not found**エラー：
   - ファイル名の大文字小文字を確認
   - `git config core.ignorecase false`を実行済みか確認

2. **Prismaエラー**：
   - `DATABASE_URL`が正しく設定されているか確認
   - Pooled URLを使用しているか確認

3. **NextAuthエラー**：
   - `NEXTAUTH_SECRET`が設定されているか確認
   - `NEXTAUTH_URL`が正しいURLになっているか確認

### データベース接続エラー

- NeonのダッシュボードでDBが起動しているか確認
- 接続文字列に`?sslmode=require`が含まれているか確認
- Pooled接続には`&pgbouncer=true`を追加

## 📌 確認事項

- [ ] GitHubへのプッシュ完了
- [ ] Vercelでプロジェクト作成
- [ ] 環境変数設定完了
- [ ] ビルド成功
- [ ] デプロイ成功
- [ ] ログイン画面が表示される

## 🎉 デプロイ成功後

アプリケーションが正常にデプロイされたら：
1. ログイン画面が表示されることを確認
2. 新規ユーザー登録を実行
3. ログインして動作確認

問題が発生した場合は、Vercelのログを確認してエラーメッセージを特定してください。