import { getEnv } from "~/lib/env.server";

import type { OcrInput, OcrProvider, OcrResult } from "./types";

export const googleVisionProvider: OcrProvider = {
  async recognize(input: OcrInput): Promise<OcrResult> {
    const env = getEnv();
    if (!env.GOOGLE_CLOUD_VISION_KEY) {
      throw new Error("GOOGLE_CLOUD_VISION_KEY is not configured");
    }

    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${env.GOOGLE_CLOUD_VISION_KEY}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: input.imageBase64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            imageContext: { languageHints: ["ja"] },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      responses: Array<{ fullTextAnnotation?: { text?: string } }>;
    };
    const rawText = data.responses[0]?.fullTextAnnotation?.text ?? "";
    return { rawText, provider: "google-vision" };
  },
};
