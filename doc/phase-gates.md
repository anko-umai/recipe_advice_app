# Phase ゲートと残課題マッピング

- **バージョン**: 0.1
- **最終更新日**: 2026-04-18
- **用途**: 各 Phase が `requirements.md` §10.3 のどの残課題に依存するかを明示し、着手順序の判断材料にする。

---

## 凡例

- ✅ 着手可（残課題ブロックなし）
- ⚠ 部分着手可（残課題で仕上げ不能）
- ⛔ ブロック（残課題の解消が必要）

---

## Phase 0: 環境構築と技術検証

**状態**: ✅ **完了（このコミット時点）**

| タスク | 状態 |
|--------|------|
| Remix + Vite + TS + Tailwind v4 + shadcn/ui スキャフォールド | ✅ |
| ESLint / Prettier / TypeScript strict / Vitest セットアップ | ✅ |
| LLM / OCR プロバイダ抽象化（mock フォールバック） | ✅ |
| ストリーミング応答 PoC (`/api/streaming-poc`) | ✅（Node で動作確認、CF Workers 上は実デプロイ後に再検証） |
| Supabase マイグレーション + RLS + 食材マスタ初期シード（33件） | ✅ |
| GitHub Actions CI（lint / typecheck / test / build） | ✅ |
| PR / Issue テンプレ | ✅ |
| ヘルスチェック `/healthz` | ✅ |

**検証結果**

- `npm run typecheck` → PASS
- `npm run lint` → PASS
- `npm test` → 4/4 PASS
- `npm run build` → PASS
- `npm run dev` → HTTP 200 確認済み（/ と /healthz と /api/streaming-poc）

**残る外部要件**（残課題ではなくクレデンシャル設定）

- Supabase プロジェクト作成 + `.env.local` 反映
- Anthropic API キー発行 + `.env.local` 反映
- Google Cloud Vision API キー発行 + `.env.local` 反映
- Cloudflare Pages + Workers の実デプロイ（CF Workers ストリーミング PoC の本番確認はここで実施）

---

## Phase 1 Sprint 1: 認証と食料在庫CRUD（Issue #2）

**状態**: ⚠ **部分着手可**

| 依存 | 種別 | 備考 |
|------|------|------|
| 食材マスタの初期データ整備（500件目安） | §10.3 残課題 | 現状33件の最小シードのみ。MVPテストは可だが、UX品質の担保には500件整備が必要。 |
| Supabase 実プロジェクト | 外部クレデンシャル | 設定のみで解消可。 |

**着手可能な範囲**

- Supabase SSR クライアント（`app/lib/supabase/`）実装
- 認証ルート（login / signup / logout / auth callback）
- 在庫 CRUD ルート（/inventory, /inventory/new, /inventory/$id/edit）
- バリデーション（Zod）
- 単体テスト・E2E テスト

**ブロック要因**

- 本番品質の食材サジェストには 500件規模の `ingredient_master` が必要（§10.3）

---

## Phase 1 Sprint 2: AIレシピ提案機能（Issue #3）

**状態**: ⛔ **ブロック**

| 依存 | 種別 | 備考 |
|------|------|------|
| レシピ生成プロンプトの最終仕様 | §10.3 残課題 | 出力JSONスキーマ、制約条件（食材量、手順数、安全性）を確定する必要あり。 |
| 食材マスタ整備 | §10.3 残課題 | 提案品質に直結。 |

**ブロック解消に必要な作業**

1. `selection-prompts.md` に「レシピ生成プロンプト設計依頼」テンプレを追加
2. プロンプト & 出力スキーマを Zod で定義し、`doc/recipe-prompt-spec.md` として確定
3. 食材マスタ 500件整備

---

## Phase 1 Sprint 3: 手動調理記録（Issue #4）

**状態**: ⚠ **Sprint 2 依存**

Sprint 2 の `recipes` テーブル運用・お気に入り保存フローが確定した後に着手が自然。Sprint 1 の DB スキーマは既に存在するため、`cooking_logs` 単独実装は可能だが、レシピ詳細画面との統合は Sprint 2 に依存。

---

## Phase 2: レシートOCR（Issue #5）

**状態**: ⛔ **ブロック**

| 依存 | 種別 | 備考 |
|------|------|------|
| レシート店舗テンプレート（主要スーパー別フォーマット） | §10.3 残課題 | OCR 結果 → 商品名正規化の精度に直結。 |
| OCR → 構造化プロンプト設計 | §10.3 に準ずる | Sprint 2 のプロンプト設計と並行検討推奨。 |

---

## Phase 2: カレンダーUIとPWA（Issue #6）

**状態**: ⚠ **一部着手可**

| 依存 | 種別 | 備考 |
|------|------|------|
| デザイントークン確定（カラー・フォント・余白） | §10.3 残課題 | 現状は Tailwind v4 + OKLCH デフォルトで仮運用中。 |

カレンダー・PWA 実装は技術面では着手可能。デザイン刷新時に調整。

---

## Phase 3: 在庫自動減算（Issue #7）

**状態**: ⚠ **Sprint 2 の在庫消費フロー確定後**

DB スキーマ・RLS は先行整備済み。UI 実装は Phase 1 Sprint 2 で確定する「レシピの材料スキーマ」に依存。

---

## Phase 3: リリース準備（Issue #8）

**状態**: ⛔ **ブロック**

| 依存 | 種別 | 備考 |
|------|------|------|
| 利用規約の作成 | §10.3 残課題 | 公開前必須。 |
| プライバシーポリシーの作成 | §10.3 残課題 | レシート画像・OCR・LLM 送信の説明が必要。 |
| 障害時の通知先・オンコール体制 | §10.3 残課題 | 個人開発なら Sentry → メール通知で最小実装可。 |

---

## 推奨する次アクション

1. **食材マスタ 500件整備** → Phase 1 Sprint 1 完走を可能にする
2. **レシピ生成プロンプト仕様策定** → Phase 1 Sprint 2 のブロック解除（最大のボトルネック）
3. Supabase / Anthropic / Google Cloud / Cloudflare の実アカウント連携
4. 上記が整えば Phase 1 Sprint 1 → Sprint 2 → Sprint 3 を順次完走可能

> 「まずプロンプト仕様を決める」ことが最もレバレッジが高い。レシピ生成と OCR 構造化で同じプロンプト設計思想を流用できる。
