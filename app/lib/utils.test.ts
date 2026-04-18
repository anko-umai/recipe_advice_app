import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn()", () => {
  it("merges tailwind classes and removes conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("respects conditional entries", () => {
    expect(cn("text-sm", { "font-bold": true, hidden: false })).toBe(
      "text-sm font-bold",
    );
  });
});
