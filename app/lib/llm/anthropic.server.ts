import Anthropic from "@anthropic-ai/sdk";

import { getEnv } from "~/lib/env.server";

import type {
  LlmGenerateOptions,
  LlmGenerateResult,
  LlmProvider,
} from "./types";

function getClient(): Anthropic {
  const env = getEnv();
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Check .env.local or Cloudflare secrets.",
    );
  }
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

function resolveModel(choice: LlmGenerateOptions["model"]): string {
  const env = getEnv();
  return choice === "advanced"
    ? env.ANTHROPIC_MODEL_ADVANCED
    : env.ANTHROPIC_MODEL_PRIMARY;
}

export const anthropicProvider: LlmProvider = {
  async generate(options): Promise<LlmGenerateResult> {
    const client = getClient();
    const model = resolveModel(options.model);
    const response = await client.messages.create({
      model,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature,
      system: options.system,
      messages: options.messages,
    });
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      model,
    };
  },

  async *stream(options) {
    const client = getClient();
    const model = resolveModel(options.model);
    const stream = await client.messages.stream({
      model,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature,
      system: options.system,
      messages: options.messages,
    });
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  },
};
