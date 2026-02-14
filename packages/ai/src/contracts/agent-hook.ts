import { z } from 'zod';

export const HookClassifySchema = z.object({
  id: z.string(),
  type: z.literal('hook_classify'),
  created_at: z.string(),
  data: z.object({
    category: z.enum(['question', 'contrarian', 'data_led', 'story_led', 'framework_led']),
    emotionalTriggers: z.array(z.string()),
    curiosityGapScore: z.number().min(0).max(1),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const HookScoreSchema = z.object({
  id: z.string(),
  type: z.literal('hook_score'),
  created_at: z.string(),
  data: z.object({
    overallScore: z.number().min(0).max(1),
    emotionalTriggerScore: z.number().min(0).max(1),
    curiosityGapScore: z.number().min(0).max(1),
    improvementSuggestions: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const HookImproveSchema = z.object({
  id: z.string(),
  type: z.literal('hook_improve'),
  created_at: z.string(),
  data: z.object({
    original: z.string(),
    improved: z.string(),
    changes: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type HookClassify = z.infer<typeof HookClassifySchema>;
export type HookScore = z.infer<typeof HookScoreSchema>;
export type HookImprove = z.infer<typeof HookImproveSchema>;
