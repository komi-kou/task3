# Render デプロイメント修正ガイド

## 🔧 修正内容

以下の修正を行いました：

### 1. package.json の修正
- `build`スクリプトに`npx prisma generate`を追加
- `postinstall`スクリプトを追加
- `prisma:migrate`スクリプトを追加

### 2. render.yaml の最適化
- ビルドコマンドを`npm ci && npm run postinstall && npm run build`に変更
- スタートコマンドを`npm run prisma:migrate && npm start`に変更
- PORT環境変数を追加

### 3. 環境変数サンプルファイルの作成
`.env.example`ファイルを作成しました。

## 📋 デプロイ手順

### 1. GitHubにプッシュ
```bash
git add .
git commit -m "Fix Render deployment configuration"
git push origin main
```

### 2. Renderでの設定確認

1. Renderダッシュボードにログイン
2. 以下の環境変数が設定されているか確認：
   - `DATABASE_URL` - PostgreSQLの接続文字列（自動設定）
   - `NEXTAUTH_SECRET` - ランダムな文字列（自動生成）
   - `NEXTAUTH_URL` - アプリケーションのURL（自動設定）

### 3. データベースの確認
- Renderのダッシュボードで`crm-db`データベースが作成されているか確認
- ステータスが`Available`になっているか確認

### 4. 再デプロイ
1. Renderダッシュボードで「Manual Deploy」をクリック
2. 「Deploy latest commit」を選択
3. デプロイログを確認

## 🐛 トラブルシューティング

### ビルドエラーが発生する場合
1. ログで具体的なエラーメッセージを確認
2. `npm ci`が失敗する場合は、`package-lock.json`が最新か確認
3. Prismaエラーの場合は、DATABASE_URLが正しく設定されているか確認

### データベース接続エラー
1. DATABASE_URLの形式を確認：
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```
2. データベースが起動しているか確認
3. SSL設定（`sslmode=require`）が含まれているか確認

### アプリケーションが起動しない
1. PORTが3000に設定されているか確認
2. NEXTAUTH_URLが正しいURLになっているか確認
3. ログでエラーメッセージを確認

## 📝 確認項目チェックリスト

- [ ] GitHubに最新の変更がプッシュされている
- [ ] render.yamlファイルが正しく設定されている
- [ ] package.jsonのスクリプトが更新されている
- [ ] Renderで環境変数が設定されている
- [ ] データベースが作成され、利用可能な状態
- [ ] ビルドログにエラーがない
- [ ] アプリケーションが正常に起動している

## 🚀 デプロイ成功後

アプリケーションURL（`https://crm-task-manager.onrender.com`）にアクセスして動作確認を行ってください。