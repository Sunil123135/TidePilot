/**
 * Production OCR Service
 * - Tesseract.js for text recognition with word-level bounding boxes
 * - Sharp for image preprocessing and PDF page rendering
 * - Uses Tesseract's built-in block/paragraph/line layout (PSM 6)
 */
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import { OcrResultSchema, OcrCleanSchema } from './contracts';

const TESSERACT_LANG = 'eng';

function stubId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function runTesseractOnImage(
  imageBuffer: Buffer
): Promise<{ text: string; words: Array<{ text: string; confidence: number; bbox?: { x: number; y: number; w: number; h: number } }> }> {
  const worker = await createWorker(TESSERACT_LANG, 1, {
    logger: () => {},
  });
  try {
    const ret = await worker.recognize(imageBuffer, {}, { blocks: true });
    await worker.terminate();
    const words: Array<{ text: string; confidence: number; bbox?: { x: number; y: number; w: number; h: number } }> = [];
    let fullText = ret.data.text ?? '';
    if (ret.data.blocks) {
      for (const block of ret.data.blocks) {
        for (const paragraph of block.paragraphs ?? []) {
          for (const line of paragraph.lines ?? []) {
            for (const word of line.words ?? []) {
              const conf = (word.confidence ?? 0) / 100;
              const bbox = word.bbox
                ? {
                    x: word.bbox.x0,
                    y: word.bbox.y0,
                    w: word.bbox.x1 - word.bbox.x0,
                    h: word.bbox.y1 - word.bbox.y0,
                  }
                : undefined;
              words.push({ text: word.text ?? '', confidence: conf, bbox });
            }
          }
        }
      }
    }
    if (words.length === 0 && fullText) {
      words.push({ text: fullText.trim(), confidence: 0.85 });
    }
    return { text: fullText, words };
  } finally {
    await worker.terminate().catch(() => {});
  }
}

/**
 * Extract text from image buffer using production-grade Tesseract.js.
 * Returns word-level bounding boxes from Tesseract's layout analysis.
 */
export async function extractTextFromImage(
  bufferOrRef: Buffer | { fileAssetId: string }
): Promise<
  | { ok: true; data: { blocks: Array<{ text: string; confidence: number; bbox?: { x: number; y: number; w: number; h: number } }>; fullText: string; confidence_score: number } }
  | { ok: false; error: string }
> {
  let imageBuffer: Buffer;
  if (Buffer.isBuffer(bufferOrRef)) {
    imageBuffer = bufferOrRef;
  } else {
    return { ok: false, error: 'Buffer required for OCR; fileAssetId not supported' };
  }
  try {
    const meta = await sharp(imageBuffer).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (width === 0 || height === 0) {
      return { ok: false, error: 'Invalid image dimensions' };
    }
    // Preprocess: normalize to PNG, ensure reasonable size for Tesseract
    const maxDim = 3000;
    let processed = sharp(imageBuffer);
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      processed = processed.resize(Math.round(width * scale), Math.round(height * scale));
    }
    const pngBuffer = await processed.png().toBuffer();
    const result = await runTesseractOnImage(pngBuffer);
    const fullText = result.text.trim().replace(/\n{3,}/g, '\n\n');
    const allWords = result.words;
    const blocks = allWords.map((w) => ({
      text: w.text,
      confidence: Math.min(1, Math.max(0, w.confidence)),
      bbox: w.bbox,
    }));
    const avgConf = blocks.length > 0
      ? blocks.reduce((s, b) => s + b.confidence, 0) / blocks.length
      : 0.85;
    const stub = {
      id: stubId('ocr'),
      type: 'ocr_result' as const,
      created_at: new Date().toISOString(),
      data: {
        blocks,
        fullText: fullText || 'No text detected.',
        detectedLanguage: 'en',
        confidence_score: Math.min(1, Math.max(0, avgConf)),
      },
    };
    const parsed = OcrResultSchema.safeParse(stub);
    if (parsed.success) {
      return { ok: true, data: parsed.data.data };
    }
    return { ok: false, error: 'OCR validation failed' };
  } catch (e) {
    return { ok: false, error: String(e instanceof Error ? e.message : e) };
  }
}

/**
 * Extract text from PDF by rendering pages to images then OCR.
 */
export async function extractTextFromPdfImages(
  pdfBufferOrRef: Buffer | string
): Promise<
  | { ok: true; data: { blocks: Array<{ text: string; confidence: number }>; fullText: string; confidence_score: number } }
  | { ok: false; error: string }
> {
  let pdfBuffer: Buffer;
  if (Buffer.isBuffer(pdfBufferOrRef)) {
    pdfBuffer = pdfBufferOrRef;
  } else if (typeof pdfBufferOrRef === 'string') {
    return { ok: false, error: 'PDF buffer required; file path/ID not supported in serverless context' };
  } else {
    return { ok: false, error: 'Invalid PDF input' };
  }
  try {
    const { fromBuffer } = await import('pdf2pic');
    const options = {
      density: 200,
      format: 'png' as const,
      width: 1200,
      height: 1600,
    };
    const convert = fromBuffer(pdfBuffer, options);
    const pageCount = 20;
    const allBlocks: Array<{ text: string; confidence: number }> = [];
    let fullText = '';
    for (let p = 1; p <= pageCount; p++) {
      try {
        const result = await convert(p, { responseType: 'buffer' });
        const buf = (result as { buffer?: Buffer })?.buffer;
        if (!buf) break;
        const pageResult = await extractTextFromImage(buf);
        if (!pageResult.ok) break;
        fullText += pageResult.data.fullText + '\n\n';
        allBlocks.push(...pageResult.data.blocks);
      } catch {
        break;
      }
    }
    fullText = fullText.trim().replace(/\n{3,}/g, '\n\n');
    const avgConf = allBlocks.length > 0
      ? allBlocks.reduce((s, b) => s + b.confidence, 0) / allBlocks.length
      : 0.85;
    return {
      ok: true,
      data: {
        blocks: allBlocks,
        fullText: fullText || 'No text detected in PDF.',
        confidence_score: Math.min(1, Math.max(0, avgConf)),
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('gm') || msg.includes('GraphicsMagick') || msg.includes('convert')) {
      return {
        ok: false,
        error: 'PDF conversion requires GraphicsMagick. Install: https://graphicsmagick.org/',
      };
    }
    return { ok: false, error: msg };
  }
}

/**
 * Clean OCR output: remove headers/footers, normalize line breaks.
 */
export async function cleanOcrText(
  rawText: string
): Promise<
  | { ok: true; data: { cleanedText: string; detectedLanguage: string; warnings: string[]; confidence_score: number } }
  | { ok: false; error: string }
> {
  const warnings: string[] = [];
  let cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const origLen = rawText.length;
  if (cleaned.length !== origLen) {
    warnings.push('Normalized line breaks');
  }
  const lines = cleaned.split('\n');
  if (lines.length > 4) {
    const firstLine = lines[0]?.trim() ?? '';
    const lastLine = lines[lines.length - 1]?.trim() ?? '';
    if (firstLine.length < 50 && /^\d+$|^page\s*\d+|^-\s*\d+\s*-$/i.test(firstLine)) {
      cleaned = lines.slice(1).join('\n').trim();
      warnings.push('Removed header');
    }
    if (lastLine.length < 50 && /^\d+$|^page\s*\d+/i.test(lastLine)) {
      cleaned = lines.slice(0, -1).join('\n').trim();
      warnings.push('Removed footer');
    }
  }
  const stub = {
    id: stubId('clean'),
    type: 'ocr_clean' as const,
    created_at: new Date().toISOString(),
    data: {
      cleanedText: cleaned,
      detectedLanguage: 'en',
      warnings,
      confidence_score: 0.9,
    },
  };
  const parsed = OcrCleanSchema.safeParse(stub);
  if (parsed.success) {
    return { ok: true, data: parsed.data.data };
  }
  return { ok: false, error: 'Clean validation failed' };
}
