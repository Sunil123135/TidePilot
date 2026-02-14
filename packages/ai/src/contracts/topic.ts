import { z } from 'zod';

export const TopicGapAnalysisSchema = z.object({
  id: z.string(),
  type: z.literal('topic_gap'),
  created_at: z.string(),
  data: z.object({
    gaps: z.array(
      z.object({
        topic: z.string(),
        weeksSinceLastPost: z.number(),
        suggestedAngle: z.string().optional(),
      })
    ),
    overusedThemes: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type TopicGapAnalysis = z.infer<typeof TopicGapAnalysisSchema>;
