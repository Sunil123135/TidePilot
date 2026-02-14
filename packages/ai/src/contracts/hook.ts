import { z } from 'zod';

export const HookVariantSchema = z.object({
  id: z.string(),
  type: z.literal('hook_variant'),
  created_at: z.string(),
  data: z.object({
    variants: z.array(
      z.object({
        text: z.string(),
        category: z.enum(['question', 'contrarian', 'data_led', 'story_led', 'framework_led']),
        voiceMatchScore: z.number().min(0).max(1),
      })
    ),
    confidence_score: z.number().min(0).max(1),
  }),
});

export type HookVariant = z.infer<typeof HookVariantSchema>;
