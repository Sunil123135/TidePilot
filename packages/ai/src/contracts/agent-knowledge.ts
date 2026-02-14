import { z } from 'zod';

export const KnowledgeGraphSchema = z.object({
  id: z.string(),
  type: z.literal('knowledge_graph'),
  created_at: z.string(),
  data: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      label: z.string(),
      strength: z.number(),
      postCount: z.number().optional(),
    })),
    edges: z.array(z.object({
      source: z.string(),
      target: z.string(),
      weight: z.number(),
    })),
    strongestCluster: z.string().optional(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const IntellectualTerritorySchema = z.object({
  id: z.string(),
  type: z.literal('intellectual_territory_map'),
  created_at: z.string(),
  data: z.object({
    territories: z.array(z.object({
      theme: z.string(),
      strength: z.number(),
      evidence: z.string(),
    })),
    expansionZones: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const TopicExpansionSchema = z.object({
  id: z.string(),
  type: z.literal('topic_expansion_suggest'),
  created_at: z.string(),
  data: z.object({
    suggestions: z.array(z.object({
      topic: z.string(),
      angle: z.string(),
      suggestedPost: z.string(),
    })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;
export type IntellectualTerritory = z.infer<typeof IntellectualTerritorySchema>;
export type TopicExpansion = z.infer<typeof TopicExpansionSchema>;
