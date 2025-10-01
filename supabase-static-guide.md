# Supabase + 静的ホスティング

## バックエンド（Supabase）
1. https://supabase.com でプロジェクト作成
2. データベースURLを取得
3. Edge FunctionsでAPIエンドポイント作成

## フロントエンド選択

### GitHub Pages（完全無料）
```bash
npm run build
npm run export
# outディレクトリをGitHub Pagesにデプロイ
```

### Cloudflare Pages（無料・高速）
1. https://pages.cloudflare.com
2. GitHubリポジトリ接続
3. ビルド設定：
   - Build command: `npm run build`
   - Build output: `.next`

## この方法のメリット
- ✅ 完全無料
- ✅ 高速
- ✅ スケーラブル