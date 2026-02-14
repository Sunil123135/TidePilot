import { z } from 'zod';

export const OcrBlockSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  bbox: z
    .object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })
    .optional(),
});

export const OcrResultSchema = z.object({
  id: z.string(),
  type: z.literal('ocr_result'),
  created_at: z.string(),
  data: z.object({
    blocks: z.array(OcrBlockSchema),
    fullText: z.string(),
    detectedLanguage: z.string().optional(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const OcrCleanSchema = z.object({
  id: z.string(),
  type: z.literal('ocr_clean'),
  created_at: z.string(),
  data: z.object({
    cleanedText: z.string(),
    detectedLanguage: z.string(),
    warnings: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type OcrResult = z.infer<typeof OcrResultSchema>;
export type OcrClean = z.infer<typeof OcrCleanSchema>;
