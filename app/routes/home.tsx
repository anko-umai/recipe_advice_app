import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function meta() {
  return [
    { title: "Recipe Advice App" },
    {
      name: "description",
      content:
        "購入した食材の在庫管理と、在庫から作れるレシピをAIが提案するWebアプリ（MVP）",
    },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Recipe Advice App
        </h1>
        <p className="text-muted-foreground">
          食材管理 × AIレシピ提案（Phase 0 セットアップ確認ページ）
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Phase 0: セットアップ確認</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            このページが表示されていれば、Remix + Vite + Tailwind v4 +
            shadcn/ui の土台が動作しています。
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              ヘルスチェック:{" "}
              <a
                className="underline underline-offset-4"
                href="/healthz"
              >
                /healthz
              </a>
            </li>
            <li>
              ストリーミングPoC:{" "}
              <a
                className="underline underline-offset-4"
                href="/api/streaming-poc?prompt=hello"
              >
                /api/streaming-poc
              </a>
            </li>
          </ul>
          <div className="pt-2">
            <Button>ボタンコンポーネント動作確認</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
