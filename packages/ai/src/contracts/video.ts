import { z } from 'zod';

const SceneSchema = z.object({
  title: z.string(),
  text: z.string(),
  durationSeconds: z.number(),
});

export const VideoScriptSchema = z.object({
  id: z.string(),
  type: z.literal('video_script'),
  created_at: z.string(),
  data: z.object({
    hook: z.string(),
    scenes: z.array(SceneSchema),
    cta: z.string(),
    totalDurationSeconds: z.number().optional(),
  }),
  render_hint: z.string().optional(),
});

export type VideoScript = z.infer<typeof VideoScriptSchema>;
export type VideoScriptScene = z.infer<typeof SceneSchema>;
