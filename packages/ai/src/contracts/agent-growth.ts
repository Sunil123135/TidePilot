import { z } from 'zod';

export const GrowthSimulateSchema = z.object({
  id: z.string(),
  type: z.literal('growth_simulate'),
  created_at: z.string(),
  data: z.object({
    projections: z.array(z.object({
      month: z.number(),
      authorityScore: z.number(),
      engagement: z.number(),
    })),
    fatigueDetected: z.boolean(),
    optimalFrequency: z.number(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const AuthorityProjectionSchema = z.object({
  id: z.string(),
  type: z.literal('authority_projection'),
  created_at: z.string(),
  data: z.object({
    currentScore: z.number(),
    projectedScore: z.number(),
    monthsToProject: z.number(),
    trajectory: z.array(z.object({ month: z.number(), score: z.number() })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const PostFrequencyOptimizerSchema = z.object({
  id: z.string(),
  type: z.literal('post_frequency_optimizer'),
  created_at: z.string(),
  data: z.object({
    recommendedPostsPerWeek: z.number(),
    bestDays: z.array(z.string()),
    fatigueRisk: z.boolean(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type GrowthSimulate = z.infer<typeof GrowthSimulateSchema>;
export type AuthorityProjection = z.infer<typeof AuthorityProjectionSchema>;
export type PostFrequencyOptimizer = z.infer<typeof PostFrequencyOptimizerSchema>;
