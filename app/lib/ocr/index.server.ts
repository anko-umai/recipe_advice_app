import { getEnv } from "~/lib/env.server";

import { googleVisionProvider } from "./google-vision.server";
import { mockOcrProvider } from "./mock.server";
import type { OcrProvider } from "./types";

export function getOcrProvider(): OcrProvider {
  const env = getEnv();
  return env.GOOGLE_CLOUD_VISION_KEY ? googleVisionProvider : mockOcrProvider;
}

export type { OcrProvider } from "./types";
