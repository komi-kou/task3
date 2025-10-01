# 🚀 自動デプロイガイド（Vercel + Supabase）

このガイドでは、**完全無料**でタスク管理ツールを自動デプロイする手順を説明します。

## 📋 必要なサービス（すべて無料）

1. **Vercel** - ホスティング（自動デプロイ対応）
2. **Supabase** - PostgreSQLデータベース
3. **GitHub** - ソースコード管理

## 🎯 ステップ1: Supabaseのセットアップ（5分）

### 1.1 アカウント作成
1. [Supabase](https://supabase.com) にアクセス
2. GitHubアカウントでサインアップ

### 1.2 新規プロジェクト作成
1. 「New Project」をクリック
2. プロジェクト名: `crm-task-manager`
3. データベースパスワード: 安全なパスワードを生成（保存しておく）
4. リージョン: `Northeast Asia (Tokyo)` を選択
5. 「Create new project」をクリック

### 1.3 データベースURLの取得
1. プロジェクトが作成されたら、左メニューの「Settings」→「Database」
2. 「Connection string」セクションの「URI」をコピー
3. 形式: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## 🎯 ステップ2: GitHubリポジトリの準備（3分）

```bash
# リポジトリを初期化（まだの場合）
git init
git add .
git commit -m "Initial commit for auto deployment"

# GitHubに新規リポジトリを作成後
git remote add origin https://github.com/YOUR_USERNAME/crm-task-manager.git
git branch -M main
git push -u origin main
```

## 🎯 ステップ3: Vercelへの自動デプロイ設定（5分）

### 3.1 Vercelアカウント作成
1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでサインイン

### 3.2 プロジェクトのインポート
1. 「Add New」→「Project」をクリック
2. GitHubリポジトリをインポート
3. 「Import」をクリック

### 3.3 環境変数の設定
Vercelのプロジェクト設定画面で以下の環境変数を追加:

| 変数名 | 値 |
|--------|-----|
| `DATABASE_URL` | Supabaseから取得したURL |
| `NEXTAUTH_SECRET` | ランダムな32文字（下記コマンドで生成） |
| `NEXTAUTH_URL` | `https://your-app.vercel.app`（後で更新） |

**NEXTAUTH_SECRET生成コマンド:**
```bash
openssl rand -base64 32
```

### 3.4 デプロイ設定
1. Framework Preset: `Next.js` (自動検出される)
2. Build Command: `prisma generate && prisma db push && next build`
3. Output Directory: `.next` (デフォルト)
4. Install Command: `npm install`

### 3.5 デプロイ実行
「Deploy」ボタンをクリック

## 🎯 ステップ4: 初回設定（デプロイ後）

### 4.1 URLの更新
1. デプロイが完了したら、発行されたURLをコピー
2. Vercelの環境変数で`NEXTAUTH_URL`を実際のURLに更新
3. 再デプロイを実行

### 4.2 データベースの初期化
Vercelのターミナルまたはローカルで:

```bash
# 環境変数を設定
export DATABASE_URL="your-supabase-url"

# スキーマをプッシュ
npx prisma db push

# 初期データを投入（オプション）
node scripts/seed.js
```

## ✅ 動作確認

1. https://your-app.vercel.app にアクセス
2. アカウントを登録
3. ログインして機能を確認

## 🔄 自動デプロイの仕組み

GitHubのmainブランチにプッシュすると、Vercelが自動的に:
1. コードを取得
2. 依存関係をインストール
3. ビルドを実行
4. デプロイを完了

```bash
# 変更をデプロイ
git add .
git commit -m "Update features"
git push origin main
# → 自動的にVercelでデプロイが開始される
```

## 🛠 トラブルシューティング

### ビルドエラーの場合
1. Vercelのログを確認
2. `prisma generate`が実行されているか確認
3. 環境変数が正しく設定されているか確認

### データベース接続エラー
1. DATABASE_URLが正しいか確認
2. Supabaseのダッシュボードでデータベースが稼働中か確認

### 認証エラー
1. NEXTAUTH_SECRETが設定されているか確認
2. NEXTAUTH_URLが正しいURLになっているか確認

## 📊 無料枠の制限

### Vercel（無料枠）
- 100GB帯域幅/月
- 無制限のデプロイ
- カスタムドメイン対応
- SSL証明書自動発行

### Supabase（無料枠）
- 500MBデータベース
- 2GBストレージ
- 50,000月間アクティブユーザー
- 無制限のAPIリクエスト

## 🎉 完了！

これで自動デプロイの設定が完了しました。
今後はGitHubにプッシュするだけで自動的に本番環境が更新されます。

## 📝 メモ

- プロダクション用のスキーマは`prisma/schema.production.prisma`を使用
- ローカル開発時は`prisma/schema.prisma`（SQLite）を使用
- 必要に応じてGitHub Actionsでテストを追加可能