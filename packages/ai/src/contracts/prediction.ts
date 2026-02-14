import { z } from 'zod';

export const PerformancePredictionSchema = z.object({
  id: z.string(),
  type: z.literal('performance_prediction'),
  created_at: z.string(),
  data: z.object({
    predictedEngagement: z.number().min(0).max(1),
    hookStrengthScore: z.number().min(0).max(1),
    audienceResonance: z.number().min(0).max(1),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type PerformancePrediction = z.infer<typeof PerformancePredictionSchema>;
