import { describe, it, expect } from 'vitest';
import {
  extractTextFromImage,
  extractTextFromPdfImages,
  cleanOcrText,
} from './ocrService';

describe('OCR Service', () => {
  it('extractTextFromImage returns stub text', async () => {
    const result = await extractTextFromImage(Buffer.from('test'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.fullText).toContain('Sample extracted text');
      expect(result.data.blocks.length).toBeGreaterThan(0);
      expect(result.data.confidence_score).toBeGreaterThan(0);
    }
  });

  it('extractTextFromPdfImages returns stub text', async () => {
    const result = await extractTextFromPdfImages('stub-id');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.fullText).toBeDefined();
    }
  });

  it('cleanOcrText normalizes text', async () => {
    const result = await cleanOcrText('raw\r\n\r\n\r\ntext');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.cleanedText).toBeDefined();
      expect(result.data.detectedLanguage).toBe('en');
    }
  });
});
