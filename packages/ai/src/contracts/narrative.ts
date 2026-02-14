import { z } from 'zod';

export const NarrativePositionSchema = z.object({
  id: z.string(),
  type: z.literal('narrative_position_analysis'),
  created_at: z.string(),
  data: z.object({
    topNarrativeSignals: z.array(z.object({
      theme: z.string(),
      strength: z.number(),
      evidence: z.string().optional(),
    })),
    emergingAuthorityZones: z.array(z.string()),
    overusedThemes: z.array(z.string()),
    underrepresentedAngles: z.array(z.string()),
    summary: z.string(), // "You are becoming known for…"
    confidence_score: z.number(),
    explanation_trace: z.string().optional(),
  }),
});

export type NarrativePosition = z.infer<typeof NarrativePositionSchema>;
