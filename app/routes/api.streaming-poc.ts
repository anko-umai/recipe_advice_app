import type { Route } from "./+types/api.streaming-poc";

import { getLlmProvider } from "~/lib/llm/index.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const prompt =
    url.searchParams.get("prompt") ?? "短い自己紹介を日本語で教えて";

  const provider = getLlmProvider();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of provider.stream({
          system:
            "あなたは料理アシスタントの検証用プロンプトに応答するアシスタントです。日本語で簡潔に答えてください。",
          messages: [{ role: "user", content: prompt }],
          maxTokens: 256,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown";
        controller.enqueue(
          encoder.encode(`\n\n[stream-error] ${message}\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
