import { z } from 'zod';

export const EngagementVelocitySchema = z.object({
  id: z.string(),
  type: z.literal('engagement_velocity_analysis'),
  created_at: z.string(),
  data: z.object({
    velocityScore: z.number().min(0).max(1),
    trend: z.enum(['rising', 'stable', 'declining']),
    insights: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const EarlySuccessPredictSchema = z.object({
  id: z.string(),
  type: z.literal('early_success_predict'),
  created_at: z.string(),
  data: z.object({
    predictedEngagement: z.number().min(0).max(1),
    twoHourPredictor: z.boolean(),
    earlySignalStrength: z.number().min(0).max(1),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const PatternAnomalySchema = z.object({
  id: z.string(),
  type: z.literal('pattern_anomaly_detect'),
  created_at: z.string(),
  data: z.object({
    anomalies: z.array(z.object({ type: z.string(), description: z.string(), severity: z.string() })),
    declineAlerts: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type EngagementVelocity = z.infer<typeof EngagementVelocitySchema>;
export type EarlySuccessPredict = z.infer<typeof EarlySuccessPredictSchema>;
export type PatternAnomaly = z.infer<typeof PatternAnomalySchema>;
