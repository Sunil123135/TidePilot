import { z } from 'zod';

const InsightEvidenceSchema = z.object({
  supportingPosts: z.array(z.object({ title: z.string(), engagement: z.number().optional() })).optional(),
  avgEngagementComparison: z.string().optional(),
  suggestedExperiments: z.array(z.string()).optional(),
  severity: z.enum(['high', 'medium', 'low']).optional(),
});

const InsightSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.string().optional(),
  evidence: InsightEvidenceSchema.optional(),
  severity: z.enum(['high', 'medium', 'low']).optional(),
});

const ActionSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean().optional(),
  link: z.string().optional(),
  impactEstimate: z.string().optional(),
  timeEstimate: z.string().optional(),
  order: z.number().optional(),
});

export const WeeklyBriefSchema = z.object({
  id: z.string(),
  type: z.literal('weekly_brief'),
  created_at: z.string(),
  data: z.object({
    objective: z.string().optional(),
    insights: z.array(InsightSchema),
    actions: z.array(ActionSchema),
    postSuggestions: z.array(z.string()).optional(),
    engageWith: z.array(z.object({ name: z.string(), reason: z.string().optional() })).optional(),
  }),
  render_hint: z.string().optional(),
});

export type WeeklyBrief = z.infer<typeof WeeklyBriefSchema>;
