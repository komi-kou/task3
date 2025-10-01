# Render デプロイ手順

## 1. アカウント作成
1. https://render.com にアクセス
2. GitHubでログイン

## 2. PostgreSQL作成（無料）
1. 「New」→「PostgreSQL」
2. Free プランを選択
3. データベースURLをコピー

## 3. Webサービス作成
1. 「New」→「Web Service」
2. GitHubリポジトリを選択
3. 以下を設定：
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

## 4. 環境変数設定
- `DATABASE_URL`: PostgreSQLのURL
- `NEXTAUTH_SECRET`: ランダムな文字列
- `NEXTAUTH_URL`: RenderのURL

## 注意点
- ⚠️ 無料版は15分アクセスがないとスリープ
- ⚠️ 起動に30秒程度かかる