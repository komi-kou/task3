# Fly.io デプロイ手順

## 1. CLIインストール
```bash
# macOS
brew install flyctl

# または
curl -L https://fly.io/install.sh | sh
```

## 2. アカウント作成
```bash
fly auth signup
```
※クレジットカード登録必要（課金はされない）

## 3. アプリ作成
```bash
fly launch
```
- アプリ名を入力
- リージョンを選択（東京: nrt）
- PostgreSQLを追加するか聞かれたら「Yes」

## 4. 環境変数設定
```bash
fly secrets set NEXTAUTH_SECRET="your-secret"
fly secrets set NEXTAUTH_URL="https://your-app.fly.dev"
```

## 5. デプロイ
```bash
fly deploy
```

## メリット
- ✅ 無料枠が大きい（3GB RAM、3共有CPU）
- ✅ 高速
- ✅ 世界中にデプロイ可能