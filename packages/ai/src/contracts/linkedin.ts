import { z } from 'zod';

export const LinkedInSuggestSchema = z.object({
  id: z.string(),
  type: z.literal('linkedin_suggest'),
  created_at: z.string(),
  data: z.object({
    content: z.string(),
    suggestedHashtags: z.array(z.string()).optional(),
    hookType: z.string().optional(),
    characterCount: z.number().optional(),
  }),
  render_hint: z.string().optional(),
});

export type LinkedInSuggest = z.infer<typeof LinkedInSuggestSchema>;
