# Renderデプロイ完全ガイド（初心者向けステップバイステップ）

## 📋 事前準備

### 1. 必要なアカウントの作成
- [ ] GitHubアカウント（https://github.com）
- [ ] Renderアカウント（https://render.com）

### 2. プロジェクトの準備
すでに以下のファイルが準備されています：
- ✅ `package.json` - buildスクリプトを修正済み
- ✅ `.env.example` - 環境変数のテンプレート
- ✅ `build.sh` - ビルドスクリプト
- ✅ `render.yaml` - Renderの設定ファイル

---

## 🚀 デプロイ手順

### ステップ1：GitHubにコードをアップロード

1. **GitHubで新しいリポジトリを作成**
   - GitHubにログイン
   - 右上の「+」ボタンをクリック → 「New repository」を選択
   - Repository name: `crm-task-manager`（任意の名前）
   - Public/Privateを選択（どちらでもOK）
   - 「Create repository」をクリック

2. **ローカルのコードをGitHubにプッシュ**
   
   ターミナルで以下のコマンドを順番に実行：
   
   ```bash
   # プロジェクトフォルダに移動
   cd /Users/komiyakouhei/Desktop/タスク管理ツール/crm-task-manager
   
   # Gitリポジトリを初期化
   git init
   
   # すべてのファイルをステージング
   git add .
   
   # 最初のコミット
   git commit -m "Initial commit for CRM Task Manager"
   
   # GitHubのリポジトリと接続（URLは自分のものに置き換え）
   git remote add origin https://github.com/あなたのユーザー名/crm-task-manager.git
   
   # メインブランチに名前を変更
   git branch -M main
   
   # GitHubにプッシュ
   git push -u origin main
   ```

### ステップ2：Renderでのセットアップ

1. **Renderにログイン**
   - https://render.com にアクセス
   - GitHubアカウントでログイン（推奨）

2. **新しいBlueprintを作成**
   - ダッシュボードで「New +」ボタンをクリック
   - 「Blueprint」を選択
   - GitHubリポジトリを接続：
     - 「Connect GitHub account」をクリック
     - GitHubの認証を完了
     - 先ほど作成したリポジトリを選択

3. **Blueprintの設定**
   - Branch: `main`
   - Blueprint file path: `render.yaml`（自動で検出される）
   - 「Apply」をクリック

### ステップ3：環境変数の設定

Renderが自動でサービスを作成した後：

1. **データベースの確認**
   - Renderダッシュボードで「crm-db」というPostgreSQLデータベースが作成されているか確認
   - データベースのステータスが「Available」になるまで待つ（5-10分）

2. **Webサービスの環境変数を確認**
   - 「crm-task-manager」サービスをクリック
   - 左メニューの「Environment」を選択
   - 以下の環境変数が自動設定されているか確認：
     - `DATABASE_URL` - 自動でデータベースから取得
     - `NEXTAUTH_URL` - 自動でサービスURLから取得
     - `NEXTAUTH_SECRET` - 自動生成
     - `NODE_ENV` - production

3. **追加の環境変数（必要に応じて）**
   - 「Add Environment Variable」をクリックして追加
   - 例：`PORT=3000`など

### ステップ4：デプロイの実行

1. **初回デプロイ**
   - Renderダッシュボードの「crm-task-manager」サービスを開く
   - 「Manual Deploy」ボタンをクリック
   - 「Deploy latest commit」を選択

2. **デプロイログの確認**
   - ビルドログが表示される
   - 以下の順番で処理が実行されることを確認：
     ```
     1. npm ci （依存関係のインストール）
     2. npx prisma generate （Prismaクライアント生成）
     3. npm run build （Next.jsビルド）
     4. npx prisma migrate deploy （データベースマイグレーション）
     5. npm start （アプリケーション起動）
     ```

3. **デプロイ完了の確認**
   - ステータスが「Live」になるまで待つ（10-15分）
   - URLが表示される（例：https://crm-task-manager-xxxx.onrender.com）

### ステップ5：動作確認

1. **アプリケーションにアクセス**
   - 表示されたURLをクリック
   - ログインページが表示されることを確認

2. **初期ユーザーの作成**
   - 登録ページから新規ユーザーを作成
   - ログインして動作を確認

---

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
```
Error: Cannot find module 'xxx'
```
**解決方法：**
- `package.json`に必要な依存関係がすべて含まれているか確認
- Renderのログで`npm ci`が正常に実行されているか確認

#### 2. データベース接続エラー
```
Error: P1001: Can't reach database server
```
**解決方法：**
- データベースのステータスが「Available」か確認
- `DATABASE_URL`環境変数が正しく設定されているか確認

#### 3. Prismaエラー
```
Error: @prisma/client did not initialize yet
```
**解決方法：**
- buildコマンドに`npx prisma generate`が含まれているか確認
- `prisma/schema.prisma`ファイルが存在するか確認

#### 4. 502 Bad Gateway
**解決方法：**
- アプリケーションのログを確認
- startコマンドが正しく設定されているか確認
- ポート番号の設定を確認（環境変数`PORT`またはコード内で`process.env.PORT`を使用）

### ログの確認方法

1. Renderダッシュボードでサービスを選択
2. 「Logs」タブをクリック
3. リアルタイムログまたは過去のログを確認

---

## 📝 デプロイ後のメンテナンス

### コードの更新方法

1. **ローカルで変更を加える**
   ```bash
   # コードを編集
   # ...
   
   # 変更をコミット
   git add .
   git commit -m "Update: 機能の説明"
   
   # GitHubにプッシュ
   git push
   ```

2. **自動デプロイ**
   - GitHubにプッシュすると自動でRenderがデプロイを開始
   - Renderダッシュボードでデプロイの進行状況を確認

### データベースのバックアップ

1. Renderダッシュボードでデータベースを選択
2. 「Backups」タブをクリック
3. 「Create Manual Backup」をクリック

### パフォーマンスモニタリング

1. Renderダッシュボードでサービスを選択
2. 「Metrics」タブでCPU、メモリ使用率を確認
3. 必要に応じてプランをアップグレード

---

## 🎉 完了！

以上でRenderへのデプロイが完了です。アプリケーションのURLをブックマークして、いつでもアクセスできるようにしましょう。

### 次のステップ
- カスタムドメインの設定（Render Dashboard → Settings → Custom Domains）
- SSL証明書の設定（自動で設定される）
- チーム開発の場合は、GitHubのブランチ保護ルールの設定

### サポート
- Renderドキュメント：https://docs.render.com
- 問題が発生した場合は、Renderのコミュニティフォーラムで質問