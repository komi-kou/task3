# Renderデプロイ手順書

## 事前準備

1. **Renderアカウントの作成**
   - https://render.com でアカウントを作成
   - GitHubアカウントとの連携を推奨

2. **GitHubリポジトリの準備**
   - このプロジェクトをGitHubにプッシュ
   - プライベート/パブリックどちらでも可

## デプロイ手順

### 方法1: render.yamlを使った自動デプロイ（推奨）

1. **GitHubとの連携**
   - Renderダッシュボードで「New +」→「Blueprint」を選択
   - GitHubリポジトリを選択して接続

2. **自動デプロイ**
   - render.yamlが自動的に検出される
   - 「Apply」をクリックして自動デプロイ開始
   - データベースとWebサービスが自動作成される

### 方法2: 手動デプロイ

1. **データベースの作成**
   - 「New +」→「PostgreSQL」を選択
   - 名前: `crm-db`
   - プラン: Free
   - 「Create Database」をクリック

2. **Webサービスの作成**
   - 「New +」→「Web Service」を選択
   - GitHubリポジトリを接続
   - 以下の設定を入力:
     - Name: `crm-task-manager`
     - Region: Singapore (東京に近い)
     - Branch: main
     - Runtime: Node
     - Build Command: `npm ci && npx prisma generate && npm run build`
     - Start Command: `npx prisma migrate deploy && npm start`

3. **環境変数の設定**
   - 以下の環境変数を設定:
     ```
     DATABASE_URL: [データベースのInternal Database URLをコピー]
     NEXTAUTH_URL: https://[your-app-name].onrender.com
     NEXTAUTH_SECRET: [openssl rand -base64 32で生成した値]
     NODE_ENV: production
     ```

## NEXTAUTH_SECRETの生成方法

ローカルで以下のコマンドを実行:
```bash
openssl rand -base64 32
```

または、オンラインツール: https://generate-secret.vercel.app/32

## デプロイ後の確認

1. **ビルドログの確認**
   - Renderダッシュボードで「Logs」タブを確認
   - ビルドエラーがないか確認

2. **データベースマイグレーション**
   - 初回デプロイ時に自動的に実行される
   - `npx prisma migrate deploy`が起動時に実行

3. **アプリケーションへのアクセス**
   - https://[your-app-name].onrender.com でアクセス
   - 初回アクセスは起動に時間がかかる場合あり（無料プランの制限）

## トラブルシューティング

### ビルドエラーの場合
- package-lock.jsonがコミットされているか確認
- Node.jsバージョンの互換性を確認

### データベース接続エラー
- DATABASE_URLが正しく設定されているか確認
- Internal Database URLを使用しているか確認

### 起動時エラー
- 環境変数が全て設定されているか確認
- ログでエラーメッセージを確認

## 無料プランの制限事項

- **自動スリープ**: 15分間アクセスがないとスリープ状態になる
- **起動時間**: スリープから復帰時に30秒程度かかる
- **月間稼働時間**: 750時間/月
- **データベース容量**: 1GB
- **同時接続数**: 制限あり

## カスタムドメインの設定（オプション）

1. Renderダッシュボードで「Settings」→「Custom Domains」
2. ドメインを追加してDNS設定を更新
3. SSL証明書は自動発行される

## 継続的デプロイの設定

- GitHubのmainブランチにプッシュすると自動デプロイ
- Pull Requestプレビュー環境も利用可能（有料プラン）

## 監視とログ

- **ログ**: Renderダッシュボードの「Logs」タブで確認
- **メトリクス**: 「Metrics」タブでCPU/メモリ使用率を確認
- **アラート**: 有料プランで利用可能

## 推奨事項

1. **定期的なバックアップ**
   - データベースの定期バックアップを設定
   - 重要なデータは別途バックアップ

2. **パフォーマンス最適化**
   - 画像はCDNを使用
   - 静的アセットの最適化
   - キャッシュ戦略の実装

3. **セキュリティ**
   - 環境変数は絶対にコードにハードコードしない
   - NEXTAUTH_SECRETは定期的に更新
   - HTTPSを必ず使用（Renderは自動でHTTPS提供）