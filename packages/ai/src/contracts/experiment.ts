import { z } from 'zod';

export const ExperimentSuggestionSchema = z.object({
  id: z.string(),
  type: z.literal('experiment_suggestion'),
  created_at: z.string(),
  data: z.object({
    title: z.string(),
    description: z.string(),
    hypothesis: z.string().optional(),
    suggestedTime: z.string().optional(),
    impactEstimate: z.enum(['high', 'medium', 'low']).optional(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type ExperimentSuggestion = z.infer<typeof ExperimentSuggestionSchema>;
