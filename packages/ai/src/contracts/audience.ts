import { z } from 'zod';

export const SegmentResonanceSchema = z.object({
  id: z.string(),
  type: z.literal('segment_resonance_predict'),
  created_at: z.string(),
  data: z.object({
    segments: z.array(z.object({
      name: z.string(),
      score: z.number(),
      reason: z.string().optional(),
    })),
    confidence_score: z.number(),
    explanation_trace: z.string().optional(),
  }),
});

export type SegmentResonance = z.infer<typeof SegmentResonanceSchema>;
