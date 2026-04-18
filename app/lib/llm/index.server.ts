import { getEnv } from "~/lib/env.server";

import { anthropicProvider } from "./anthropic.server";
import { mockProvider } from "./mock.server";
import type { LlmProvider } from "./types";

export function getLlmProvider(): LlmProvider {
  const env = getEnv();
  return env.ANTHROPIC_API_KEY ? anthropicProvider : mockProvider;
}

export type { LlmProvider } from "./types";
