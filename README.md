# Recipe Advice App

食材管理 × AIレシピ提案 Webアプリ（PWA）

- **技術スタック**: Remix (React Router v7) + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui
- **BaaS/DB**: Supabase (Auth + Postgres + RLS + Storage)
- **LLM**: Anthropic Claude（Haiku 4.5 主軸）
- **OCR**: Google Cloud Vision API
- **Hosting**: Cloudflare Pages + Workers（暫定）
- **詳細**: [`doc/requirements.md`](./doc/requirements.md)

## セットアップ

```bash
# 1. 依存のインストール
npm ci

# 2. 環境変数
cp .env.example .env.local
#   必要に応じて SUPABASE_URL / ANTHROPIC_API_KEY / GOOGLE_CLOUD_VISION_KEY を設定
#   未設定の場合は mock プロバイダで動作します

# 3. 開発サーバー
npm run dev
```

- ホーム: <http://localhost:3000/>
- ヘルスチェック: <http://localhost:3000/healthz>
- ストリーミングPoC: <http://localhost:3000/api/streaming-poc?prompt=hello>

## スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー（HMR） |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド済みアプリを起動 |
| `npm run typecheck` | React Router typegen + `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier 適用 |
| `npm test` | Vitest（CI 用） |

## ディレクトリ構成

```
app/
  components/ui/      # shadcn/ui コンポーネント（プロジェクト配置型）
  lib/
    llm/              # LLM プロバイダ抽象化（Anthropic / mock）
    ocr/              # OCR プロバイダ抽象化（Google Vision / mock）
    env.server.ts     # 環境変数の Zod バリデーション
    utils.ts          # cn() 等
  routes/
    home.tsx
    healthz.ts
    api.streaming-poc.ts
  styles/globals.css  # Tailwind v4 theme（OKLCH 色空間）
  root.tsx
  routes.ts

supabase/
  migrations/         # SQL マイグレーション（Supabase CLI 想定）
  seed/               # 初期データ

doc/                  # 要件仕様書・開発計画・コスト見積もり
.github/
  workflows/ci.yml
  ISSUE_TEMPLATE/
  PULL_REQUEST_TEMPLATE.md
```

## Supabase の適用

```bash
# Supabase CLI を別途インストール（https://supabase.com/docs/guides/cli）
supabase link --project-ref <your-project-ref>
supabase db push
psql "$SUPABASE_DB_URL" -f supabase/seed/ingredient_master.seed.sql
```

## 実装状況

Phase 0 のスキャフォールディングと抽象化層、Phase 1 Sprint 1 の先行設計（DB スキーマ・RLS）までを含む。

詳細は GitHub Issues の `phase-0` / `phase-1` ラベルを参照。
