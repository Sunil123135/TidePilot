import { z } from 'zod';

export const CommentReplySchema = z.object({
  id: z.string(),
  type: z.literal('comment_reply'),
  created_at: z.string(),
  data: z.object({
    suggestions: z.array(
      z.object({
        variant: z.string(),
        text: z.string(),
        voiceMatchScore: z.number(),
      })
    ),
    confidence_score: z.number().min(0).max(1).optional(),
  }),
  render_hint: z.string().optional(),
});

export type CommentReply = z.infer<typeof CommentReplySchema>;

export const EngagementPrioritySchema = z.object({
  id: z.string(),
  type: z.literal('engagement_priority'),
  created_at: z.string(),
  data: z.object({
    priorityScore: z.number().min(0).max(1),
    suggestedDmOpener: z.string().optional(),
    reason: z.string().optional(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type EngagementPriority = z.infer<typeof EngagementPrioritySchema>;
