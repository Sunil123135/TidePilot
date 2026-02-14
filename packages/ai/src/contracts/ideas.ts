import { z } from 'zod';

export const IdeaClusteringSchema = z.object({
  id: z.string(),
  type: z.literal('idea_clustering'),
  created_at: z.string(),
  data: z.object({
    clusters: z.array(z.object({
      theme: z.string(),
      ideas: z.array(z.string()),
      momentumScore: z.number(),
      priorityScore: z.number(),
    })),
    confidence_score: z.number(),
    explanation_trace: z.string().optional(),
  }),
});

export type IdeaClustering = z.infer<typeof IdeaClusteringSchema>;
