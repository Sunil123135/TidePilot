import { z } from 'zod';

export const ReputationRiskSchema = z.object({
  id: z.string(),
  type: z.literal('reputation_risk_score'),
  created_at: z.string(),
  data: z.object({
    riskScore: z.number().min(0).max(1),
    controversyDetected: z.boolean(),
    toneEscalationRisk: z.boolean(),
    overclaimDetected: z.boolean(),
    legalLanguageDetected: z.boolean(),
    suggestions: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const ClaimValiditySchema = z.object({
  id: z.string(),
  type: z.literal('claim_validity_check'),
  created_at: z.string(),
  data: z.object({
    claims: z.array(z.object({
      text: z.string(),
      validity: z.enum(['supported', 'weak', 'unsupported']),
      suggestion: z.string().optional(),
    })),
    confidence_score: z.number().min(0).max(1),
  }),
});

export const ToneEscalationSchema = z.object({
  id: z.string(),
  type: z.literal('tone_escalation_detect'),
  created_at: z.string(),
  data: z.object({
    escalationDetected: z.boolean(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    suggestions: z.array(z.string()),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type ReputationRisk = z.infer<typeof ReputationRiskSchema>;
export type ClaimValidity = z.infer<typeof ClaimValiditySchema>;
export type ToneEscalation = z.infer<typeof ToneEscalationSchema>;
