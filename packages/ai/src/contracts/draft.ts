import { z } from 'zod';

export const DraftGenerateSchema = z.object({
  id: z.string(),
  type: z.literal('draft_generate'),
  created_at: z.string(),
  data: z.object({
    content: z.string(),
    meta: z.record(z.unknown()).optional(),
  }),
  render_hint: z.string().optional(),
});

export const RewriteToVoiceSchema = z.object({
  id: z.string(),
  type: z.literal('rewrite_to_voice'),
  created_at: z.string(),
  data: z.object({
    original: z.string(),
    rewritten: z.string(),
    changes: z.array(z.string()).optional(),
  }),
  render_hint: z.string().optional(),
});

export const PostDiagnosticSchema = z.object({
  id: z.string(),
  type: z.literal('post_diagnostic'),
  created_at: z.string(),
  data: z.object({
    hookStrength: z.number().min(0).max(1),
    clarity: z.number().min(0).max(1),
    specificity: z.number().min(0).max(1),
    ctaSoftness: z.number().min(0).max(1),
    isGeneric: z.boolean(),
    isVague: z.boolean(),
    suggestions: z.array(z.string()).optional(),
  }),
  render_hint: z.string().optional(),
});

export type DraftGenerate = z.infer<typeof DraftGenerateSchema>;
export type RewriteToVoice = z.infer<typeof RewriteToVoiceSchema>;
export type PostDiagnostic = z.infer<typeof PostDiagnosticSchema>;
