import { z } from 'zod';

export const VoiceProfileSchema = z.object({
  id: z.string(),
  type: z.literal('voice_profile'),
  created_at: z.string(),
  data: z.object({
    toneSliders: z.record(z.number()).optional(),
    forbiddenPhrases: z.array(z.string()),
    signatureMoves: z.array(z.string()),
    exampleParagraph: z.string().optional(),
  }),
  render_hint: z.string().optional(),
});

export type VoiceProfile = z.infer<typeof VoiceProfileSchema>;

export const OptimizeForReadingAloudSchema = z.object({
  id: z.string(),
  type: z.literal('optimize_reading_aloud'),
  created_at: z.string(),
  data: z.object({
    content: z.string(),
    pauseMarkers: z.array(z.string()).optional(),
    emphasis: z.array(z.string()).optional(),
    readingPace: z.string().optional(),
  }),
  render_hint: z.string().optional(),
});

export type OptimizeForReadingAloud = z.infer<typeof OptimizeForReadingAloudSchema>;
