import { z } from 'zod';

export const OptimalPublishWindowSchema = z.object({
  id: z.string(),
  type: z.literal('optimal_publish_window'),
  created_at: z.string(),
  data: z.object({
    bestSlots: z.array(z.object({
      dayOfWeek: z.string(),
      hour: z.number(),
      label: z.string(),
      score: z.number(),
      reason: z.string().optional(),
    })),
    conflictWarnings: z.array(z.object({
      message: z.string(),
      severity: z.enum(['high', 'medium', 'low']),
    })).optional(),
    topicDiversityScore: z.number().optional(),
    confidence_score: z.number(),
    explanation_trace: z.string().optional(),
  }),
});

export type OptimalPublishWindow = z.infer<typeof OptimalPublishWindowSchema>;
