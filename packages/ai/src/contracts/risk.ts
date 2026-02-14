import { z } from 'zod';

export const ReputationRiskSchema = z.object({
  id: z.string(),
  type: z.literal('reputation_risk_analysis'),
  created_at: z.string(),
  data: z.object({
    risks: z.array(z.object({
      type: z.string(),
      severity: z.enum(['high', 'medium', 'low']),
      phrase: z.string().optional(),
      suggestion: z.string().optional(),
    })),
    overallScore: z.number(),
    confidence_score: z.number(),
    explanation_trace: z.string().optional(),
  }),
});

export type ReputationRisk = z.infer<typeof ReputationRiskSchema>;
