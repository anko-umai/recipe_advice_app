import type { LlmProvider } from "./types";

const MOCK_RESPONSE =
  "[MOCK LLM] ANTHROPIC_API_KEY 未設定のため、モック応答を返しています。実キーを設定すると本物のレシピ生成に切り替わります。";

export const mockProvider: LlmProvider = {
  async generate(options) {
    const firstUser = options.messages.find((m) => m.role === "user");
    const text = `${MOCK_RESPONSE}\n\n入力プレビュー: ${
      firstUser?.content.slice(0, 80) ?? "(none)"
    }`;
    return {
      text,
      inputTokens: firstUser?.content.length ?? 0,
      outputTokens: text.length,
      model: "mock",
    };
  },

  async *stream(options) {
    const firstUser = options.messages.find((m) => m.role === "user");
    const chunks = [
      MOCK_RESPONSE,
      "\n\n入力: ",
      firstUser?.content.slice(0, 80) ?? "(none)",
    ];
    for (const chunk of chunks) {
      yield chunk;
      await new Promise((r) => setTimeout(r, 30));
    }
  },
};
