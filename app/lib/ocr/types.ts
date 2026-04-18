export interface OcrInput {
  imageBase64: string;
  mimeType: string;
}

export interface OcrResult {
  rawText: string;
  provider: string;
}

export interface OcrProvider {
  recognize(input: OcrInput): Promise<OcrResult>;
}
