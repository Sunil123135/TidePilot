import { z } from 'zod';

export const CompetitorPatternSchema = z.object({
  id: z.string(),
  type: z.literal('competitor_pattern_analysis'),
  created_at: z.string(),
  data: z.object({
    hookPatterns: z.array(z.object({
      type: z.string(),
      frequency: z.number(),
      example: z.string().optional(),
    })),
    topicCoverage: z.array(z.object({
      topic: z.string(),
      count: z.number(),
    })),
    differentiationGaps: z.array(z.string()),
    confidence_score: z.number(),
    explanation_trace: z.string().optional(),
  }),
});

export type CompetitorPattern = z.infer<typeof CompetitorPatternSchema>;
