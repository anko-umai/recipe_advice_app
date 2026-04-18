import type { OcrProvider } from "./types";

export const mockOcrProvider: OcrProvider = {
  async recognize() {
    return {
      rawText:
        "[MOCK OCR] GOOGLE_CLOUD_VISION_KEY 未設定のため、モック応答を返しています。\n実キーを設定するとレシート画像の実OCRに切り替わります。",
      provider: "mock",
    };
  },
};
