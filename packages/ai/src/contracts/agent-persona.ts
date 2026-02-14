import { z } from 'zod';

export const AudienceRewriteSchema = z.object({
  id: z.string(),
  type: z.literal('audience_rewrite'),
  created_at: z.string(),
  data: z.object({
    original: z.string(),
    rewritten: z.string(),
    audience: z.enum(['recruiters', 'operators', 'founders', 'students']),
    changes: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const SegmentAlignmentSchema = z.object({
  id: z.string(),
  type: z.literal('segment_alignment_score'),
  created_at: z.string(),
  data: z.object({
    alignmentScores: z.array(z.object({
      segment: z.string(),
      score: z.number().min(0).max(1),
      misalignment: z.string().optional(),
    })),
    recommendedAudience: z.string().optional(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type AudienceRewrite = z.infer<typeof AudienceRewriteSchema>;
export type SegmentAlignment = z.infer<typeof SegmentAlignmentSchema>;
