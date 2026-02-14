import { z } from 'zod';

export const GrowthProjectionSchema = z.object({
  id: z.string(),
  type: z.literal('growth_projection_simulation'),
  created_at: z.string(),
  data: z.object({
    curve: z.array(z.object({
      week: z.number(),
      engagement: z.number(),
      authority: z.number(),
    })),
    totalWeeks: z.number(),
    postsPerWeek: z.number(),
    confidence_score: z.number(),
    explanation_trace: z.string().optional(),
  }),
});

export type GrowthProjection = z.infer<typeof GrowthProjectionSchema>;
