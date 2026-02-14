import { z } from 'zod';

export const StrategicPositioningSchema = z.object({
  id: z.string(),
  type: z.literal('strategic_positioning_analysis'),
  created_at: z.string(),
  data: z.object({
    topSignals: z.array(z.object({ theme: z.string(), strength: z.number(), evidence: z.string().optional() })),
    driftDetected: z.boolean(),
    driftSummary: z.string().optional(),
    authorityRoadmap: z.array(z.object({ phase: z.string(), actions: z.array(z.string()), timeframe: z.string() })),
    narrativeGaps: z.array(z.object({ gap: z.string(), suggestedAngle: z.string() })),
    contentStrategy30Days: z.array(z.object({ week: z.number(), focus: z.string(), postThemes: z.array(z.string()) })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const AuthorityRoadmapSchema = z.object({
  id: z.string(),
  type: z.literal('authority_roadmap'),
  created_at: z.string(),
  data: z.object({
    phases: z.array(z.object({ name: z.string(), actions: z.array(z.string()), months: z.number() })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const ContentGapSchema = z.object({
  id: z.string(),
  type: z.literal('content_gap_detection'),
  created_at: z.string(),
  data: z.object({
    gaps: z.array(z.object({ topic: z.string(), weeksSinceLastPost: z.number(), suggestedAngle: z.string() })),
    overusedThemes: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type StrategicPositioning = z.infer<typeof StrategicPositioningSchema>;
export type AuthorityRoadmap = z.infer<typeof AuthorityRoadmapSchema>;
export type ContentGap = z.infer<typeof ContentGapSchema>;
