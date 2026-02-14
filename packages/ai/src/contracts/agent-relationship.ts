import { z } from 'zod';

export const RelationshipDepthSchema = z.object({
  id: z.string(),
  type: z.literal('relationship_depth_score'),
  created_at: z.string(),
  data: z.object({
    depthScore: z.number().min(0).max(1),
    reciprocityIndex: z.number().min(0).max(1),
    suggestedDmOpener: z.string().optional(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const ReengagementSuggestionSchema = z.object({
  id: z.string(),
  type: z.literal('reengagement_suggestion'),
  created_at: z.string(),
  data: z.object({
    contacts: z.array(z.object({
      name: z.string(),
      reason: z.string(),
      suggestedAction: z.string(),
      priorityScore: z.number().min(0).max(1),
    })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const CollabOpportunitySchema = z.object({
  id: z.string(),
  type: z.literal('collab_opportunity_detect'),
  created_at: z.string(),
  data: z.object({
    opportunities: z.array(z.object({
      contact: z.string(),
      reason: z.string(),
      suggestedAction: z.string(),
    })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type RelationshipDepth = z.infer<typeof RelationshipDepthSchema>;
export type ReengagementSuggestion = z.infer<typeof ReengagementSuggestionSchema>;
export type CollabOpportunity = z.infer<typeof CollabOpportunitySchema>;

