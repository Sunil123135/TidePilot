import { z } from 'zod';

export const MonetizationOpportunitySchema = z.object({
  id: z.string(),
  type: z.literal('monetization_opportunity'),
  created_at: z.string(),
  data: z.object({
    themes: z.array(z.object({
      theme: z.string(),
      demandScore: z.number().min(0).max(1),
      suggestedAction: z.string(),
    })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const LeadMagnetSchema = z.object({
  id: z.string(),
  type: z.literal('lead_magnet_suggest'),
  created_at: z.string(),
  data: z.object({
    suggestions: z.array(z.object({
      title: z.string(),
      format: z.string(),
      hook: z.string(),
    })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const ServicePositioningSchema = z.object({
  id: z.string(),
  type: z.literal('service_positioning_analyze'),
  created_at: z.string(),
  data: z.object({
    consultingHooks: z.array(z.string()),
    courseIdeas: z.array(z.object({ title: z.string(), angle: z.string() })),
    positioningSummary: z.string(),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type MonetizationOpportunity = z.infer<typeof MonetizationOpportunitySchema>;
export type LeadMagnet = z.infer<typeof LeadMagnetSchema>;
export type ServicePositioning = z.infer<typeof ServicePositioningSchema>;
