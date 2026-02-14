/**
 * OCR Service - Extract text from images and PDFs.
 * Stub implementation for capstone; replace with tesseract.js or server-side OCR for production.
 */
import { OcrResultSchema, OcrCleanSchema } from './contracts';

function stubId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Stub: Extract text from image buffer.
 * In production: use tesseract.js or similar.
 */
export async function extractTextFromImage(
  _buffer: Buffer | { fileAssetId: string }
): Promise<{ ok: true; data: { blocks: Array<{ text: string; confidence: number }>; fullText: string; confidence_score: number } } | { ok: false; error: string }> {
  const stub = {
    id: stubId('ocr'),
    type: 'ocr_result' as const,
    created_at: new Date().toISOString(),
    data: {
      blocks: [
        { text: 'Sample extracted text from image.', confidence: 0.92 },
        { text: 'This is a stub OCR result for capstone demo.', confidence: 0.88 },
        { text: 'Replace with tesseract.js for production.', confidence: 0.85 },
      ],
      fullText: 'Sample extracted text from image. This is a stub OCR result for capstone demo. Replace with tesseract.js for production.',
      detectedLanguage: 'en',
      confidence_score: 0.88,
    },
  };
  const parsed = OcrResultSchema.safeParse(stub);
  if (parsed.success) {
    return { ok: true, data: parsed.data.data };
  }
  return { ok: false, error: 'OCR validation failed' };
}

/**
 * Stub: Extract text from PDF (render to images then OCR).
 */
export async function extractTextFromPdfImages(
  _fileAssetId: string
): Promise<{ ok: true; data: { blocks: Array<{ text: string; confidence: number }>; fullText: string; confidence_score: number } } | { ok: false; error: string }> {
  return extractTextFromImage({ fileAssetId: _fileAssetId });
}

/**
 * Clean OCR output: remove headers/footers, normalize line breaks.
 */
export async function cleanOcrText(
  rawText: string
): Promise<{ ok: true; data: { cleanedText: string; detectedLanguage: string; warnings: string[]; confidence_score: number } } | { ok: false; error: string }> {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const stub = {
    id: stubId('clean'),
    type: 'ocr_clean' as const,
    created_at: new Date().toISOString(),
    data: {
      cleanedText: cleaned,
      detectedLanguage: 'en',
      warnings: cleaned.length !== rawText.length ? ['Normalized line breaks'] : [],
      confidence_score: 0.9,
    },
  };
  const parsed = OcrCleanSchema.safeParse(stub);
  if (parsed.success) {
    return { ok: true, data: parsed.data.data };
  }
  return { ok: false, error: 'Clean validation failed' };
}
