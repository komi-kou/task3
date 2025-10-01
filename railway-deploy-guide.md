# Railway デプロイ手順（最も簡単）

## 1. アカウント作成
1. https://railway.app にアクセス
2. GitHubでログイン

## 2. プロジェクト作成
1. 「New Project」をクリック
2. 「Deploy from GitHub repo」を選択
3. リポジトリを選択

## 3. PostgreSQL追加（自動設定）
1. 「+ New」→「Database」→「Add PostgreSQL」
2. 環境変数が自動で設定される

## 4. 環境変数追加
Railway上で以下を追加：
- `NEXTAUTH_SECRET`: ランダムな文字列
- `NEXTAUTH_URL`: Railwayが提供するURL

## 5. デプロイ
自動でデプロイが開始される

## メリット
- ✅ 設定不要
- ✅ PostgreSQL自動設定
- ✅ 無料枠あり（$5/月）
- ✅ カスタムドメイン対応