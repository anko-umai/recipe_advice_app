import { describe, expect, it } from "vitest";

import { mockProvider } from "./mock.server";

describe("mockProvider", () => {
  it("generate() returns a deterministic mock response", async () => {
    const result = await mockProvider.generate({
      messages: [{ role: "user", content: "在庫でレシピを提案して" }],
    });
    expect(result.text).toContain("MOCK LLM");
    expect(result.model).toBe("mock");
    expect(result.outputTokens).toBeGreaterThan(0);
  });

  it("stream() yields chunks including the mock marker", async () => {
    const collected: string[] = [];
    for await (const chunk of mockProvider.stream({
      messages: [{ role: "user", content: "hello" }],
    })) {
      collected.push(chunk);
    }
    expect(collected.join("")).toContain("MOCK LLM");
  });
});
