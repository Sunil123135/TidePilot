import { z } from 'zod';

export const ExperimentPlanSchema = z.object({
  id: z.string(),
  type: z.literal('experiment_plan'),
  created_at: z.string(),
  data: z.object({
    title: z.string(),
    description: z.string(),
    hypothesis: z.string(),
    variants: z.array(z.object({ id: z.string(), label: z.string(), description: z.string() })),
    duration: z.string(),
    successMetric: z.string(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const VariantCompareSchema = z.object({
  id: z.string(),
  type: z.literal('variant_compare'),
  created_at: z.string(),
  data: z.object({
    winner: z.string().optional(),
    results: z.array(z.object({
      variantId: z.string(),
      metric: z.number(),
      sampleSize: z.number(),
    })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const StatisticalSignalSchema = z.object({
  id: z.string(),
  type: z.literal('statistical_signal_check'),
  created_at: z.string(),
  data: z.object({
    significant: z.boolean(),
    pValue: z.number().optional(),
    recommendation: z.string(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type ExperimentPlan = z.infer<typeof ExperimentPlanSchema>;
export type VariantCompare = z.infer<typeof VariantCompareSchema>;
export type StatisticalSignal = z.infer<typeof StatisticalSignalSchema>;
