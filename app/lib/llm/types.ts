export type LlmMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export interface LlmGenerateOptions {
  system?: string;
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: "primary" | "advanced";
}

export interface LlmGenerateResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface LlmProvider {
  generate(options: LlmGenerateOptions): Promise<LlmGenerateResult>;
  stream(options: LlmGenerateOptions): AsyncGenerator<string, void, unknown>;
}
