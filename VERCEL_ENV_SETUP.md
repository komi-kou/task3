# 🔐 Vercel環境変数セットアップガイド

## 📋 必要な環境変数

### 1. DATABASE_URL（必須）

#### オプションA: Supabase（推奨・無料）
1. [Supabase](https://supabase.com)でアカウント作成
2. 新規プロジェクト作成
3. Settings → Database → Connection string → URIをコピー
4. 形式: `postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres`

#### オプションB: Vercel Postgres（無料枠あり）
1. Vercelダッシュボード → Storage → Create Database
2. Postgres を選択
3. 自動的にDATABASE_URLが設定される

#### オプションC: 開発用（SQLite）※本番非推奨
```
DATABASE_URL="file:./data.db"
```

### 2. NEXTAUTH_SECRET（必須）

ターミナルで生成:
```bash
openssl rand -base64 32
```

または、オンライン生成:
https://generate-secret.vercel.app/32

### 3. NEXTAUTH_URL（必須）

デプロイ後のURL:
```
https://[your-project-name].vercel.app
```

## 🚀 設定手順

### ステップ1: Vercelダッシュボードを開く
1. https://vercel.com/dashboard
2. 対象プロジェクトをクリック
3. 「Settings」タブを選択

### ステップ2: Environment Variablesページへ
1. 左メニューの「Environment Variables」をクリック

### ステップ3: 環境変数を追加

以下を一つずつ追加:

```
Key: DATABASE_URL
Value: [Supabaseから取得したURL]
Environment: ✓ Production ✓ Preview ✓ Development
[Add]をクリック

Key: NEXTAUTH_SECRET  
Value: [生成した32文字]
Environment: ✓ Production ✓ Preview ✓ Development
[Add]をクリック

Key: NEXTAUTH_URL
Value: https://[your-app].vercel.app
Environment: ✓ Production
[Add]をクリック
```

### ステップ4: 再デプロイ
1. 「Deployments」タブへ移動
2. 最新のデプロイメントの「...」メニュー
3. 「Redeploy」を選択
4. 「Redeploy」ボタンをクリック

## 🆘 トラブルシューティング

### エラー: "references Secret which does not exist"
→ 環境変数が設定されていません。上記手順で追加してください。

### エラー: "Invalid DATABASE_URL"
→ URLの形式を確認。PostgreSQL URLは以下の形式:
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

### エラー: "NEXTAUTH_URL is not set"
→ Production環境にNEXTAUTH_URLを設定

## 💡 クイック解決法

最速で動かしたい場合、Vercel Postgresを使用:

1. Vercelダッシュボード → Storage → Create Database
2. Postgresを選択して作成
3. 自動的に環境変数が設定される
4. 再デプロイ

これで環境変数エラーが解決します！