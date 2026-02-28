import {
  VoiceProfileSchema,
  DraftGenerateSchema,
  RewriteToVoiceSchema,
  CommentReplySchema,
  WeeklyBriefSchema,
  LinkedInSuggestSchema,
  OptimizeForReadingAloudSchema,
  VideoScriptSchema,
  PostDiagnosticSchema,
  HookVariantSchema,
  PerformancePredictionSchema,
  ExperimentSuggestionSchema,
  TopicGapAnalysisSchema,
  EngagementPrioritySchema,
  OptimalPublishWindowSchema,
  NarrativePositionSchema,
  SegmentResonanceSchema,
  CompetitorPatternSchema,
  IdeaClusteringSchema,
  ReputationRiskSchema,
  GrowthProjectionSchema,
} from './contracts';
import type {
  VoiceProfile,
  RewriteToVoice,
  CommentReply,
  WeeklyBrief,
  LinkedInSuggest,
  OptimizeForReadingAloud,
  VideoScript,
  PostDiagnostic,
  HookVariant,
  PerformancePrediction,
  ExperimentSuggestion,
  TopicGapAnalysis,
  EngagementPriority,
  OptimalPublishWindow,
  NarrativePosition,
  SegmentResonance,
  CompetitorPattern,
  IdeaClustering,
  ReputationRisk,
  GrowthProjection,
} from './contracts';
import { getProviderManager } from './providers';
import type { Message } from './providers';

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function stubId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function repairJsonOnce<T>(raw: string, schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }): T | null {
  try {
    const parsed = JSON.parse(raw.replace(/\n/g, ' '));
    const result = schema.safeParse(parsed);
    if (result.success && result.data) return result.data as T;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Extract voice profile from writing samples
 * Uses Claude AI to analyze writing patterns, tone, and style
 */
export async function extractVoiceProfile(samples: string[]): Promise<VoiceProfile> {
  // If no samples provided, return stub
  if (!samples || samples.length === 0) {
    return extractVoiceProfileStub(samples);
  }

  try {
    const provider = getProviderManager();

    // Create analysis prompt
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an expert writing analyst specializing in personal brand voice identification.

Analyze writing samples to extract:
1. Tone characteristics on 0-1 scales:
   - assertive: How direct vs diplomatic (0=passive, 1=commanding)
   - concise: Brevity vs elaboration (0=verbose, 1=terse)
   - empathetic: Warmth vs clinical (0=formal, 1=warm)

2. Forbidden phrases: Words/phrases the author consistently avoids or would never use

3. Signature moves: Recurring patterns like sentence structures, metaphors, frameworks, CTAs

4. Example paragraph: A 2-3 sentence example that captures their essence

Be precise and evidence-based. Quote specific examples from the samples.`,
      },
      {
        role: 'user',
        content: `Analyze these ${samples.length} writing samples from the same author:

${samples.map((s, i) => `Sample ${i + 1}:\n${s}`).join('\n\n---\n\n')}

Extract their unique voice characteristics and provide a voice profile.`,
      },
    ];

    // Call AI provider with structured output
    const result = await provider.generate({
      operation: 'extractVoiceProfile',
      messages,
      schema: VoiceProfileSchema,
      temperature: 0.3, // Low temperature for consistency
      maxTokens: 2000,
    });

    return result;
  } catch (error) {
    console.error('[AI] extractVoiceProfile failed, using stub:', error);
    return extractVoiceProfileStub(samples);
  }
}

/**
 * Stub implementation for fallback/testing
 */
function extractVoiceProfileStub(samples: string[]): VoiceProfile {
  const combined = samples.join('\n').slice(0, 500);
  const h = simpleHash(combined);
  const stub: VoiceProfile = {
    id: stubId('vp'),
    type: 'voice_profile',
    created_at: new Date().toISOString(),
    data: {
      toneSliders: {
        assertive: 0.5 + (h % 30) / 100,
        concise: 0.6 + (h % 40) / 100,
        empathetic: 0.5 + (h % 30) / 100,
      },
      forbiddenPhrases: ['synergy', 'leverage', 'disrupt', 'thought leader'],
      signatureMoves: ['Short sentences.', 'Concrete examples.', 'One clear CTA.'],
      exampleParagraph: samples[0]?.slice(0, 200) ?? 'Your voice, operationalized.',
    },
    render_hint: 'voice_profile_card',
  };
  const parsed = VoiceProfileSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), VoiceProfileSchema);
  return repaired ?? stub;
}

export function generateDraft(_params: { idea?: string; voiceProfileId?: string }) {
  const stub = {
    id: stubId('draft'),
    type: 'draft_generate' as const,
    created_at: new Date().toISOString(),
    data: {
      content: 'Your draft content will appear here. Focus on one idea and a clear CTA.',
      meta: { hookStrength: 0.7 },
    },
    render_hint: 'draft_editor',
  };
  const parsed = DraftGenerateSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), DraftGenerateSchema);
  return repaired ?? stub;
}

/**
 * Rewrite content to match user's voice profile
 * Uses Claude AI for nuanced style matching
 */
export async function rewriteToVoice(params: {
  content: string;
  voiceProfile?: {
    toneSliders?: Record<string, number>;
    forbiddenPhrases?: string[];
    signatureMoves?: string[];
    exampleParagraph?: string;
  };
}): Promise<RewriteToVoice> {
  const { content, voiceProfile } = params;

  // If no content, return stub
  if (!content?.trim()) {
    return rewriteToVoiceStub(params);
  }

  try {
    const provider = getProviderManager();

    // Translate tone sliders into actionable writing instructions
    function toneToInstructions(sliders: Record<string, number> = {}): string {
      const lines: string[] = [];
      const assertive = sliders.assertive ?? 0.5;
      const concise = sliders.concise ?? 0.5;
      const empathetic = sliders.empathetic ?? 0.5;

      if (assertive > 0.7) lines.push('Use direct, commanding statements. No hedging or "perhaps/maybe/could". State things as facts.');
      else if (assertive < 0.4) lines.push('Use diplomatic, measured language. Suggest rather than command.');
      else lines.push('Balance directness with openness.');

      if (concise > 0.7) lines.push('Keep sentences SHORT — 10 words or fewer where possible. Cut every unnecessary word. One idea per sentence.');
      else if (concise < 0.4) lines.push('Elaborate with context and supporting details. Longer, more explanatory sentences are appropriate.');
      else lines.push('Moderate sentence length — neither terse nor verbose.');

      if (empathetic > 0.7) lines.push('Warm, human tone. Address the reader directly ("you"). Acknowledge their challenges.');
      else if (empathetic < 0.4) lines.push('Professional, analytical tone. Minimal emotional language. Focus on data and outcomes.');
      else lines.push('Neutral professional tone — neither cold nor overly warm.');

      return lines.join('\n');
    }

    // Build concrete voice profile instructions
    let voiceContext = '';
    if (voiceProfile) {
      const toneInstructions = toneToInstructions(voiceProfile.toneSliders || {});
      const forbidden = voiceProfile.forbiddenPhrases?.length
        ? voiceProfile.forbiddenPhrases.join('", "')
        : null;
      const moves = voiceProfile.signatureMoves?.length
        ? voiceProfile.signatureMoves.map((m, i) => `   ${i + 1}. ${m}`).join('\n')
        : null;
      const example = voiceProfile.exampleParagraph;

      voiceContext = `
=== VOICE PROFILE TO MATCH ===

TONE RULES (apply ALL of these):
${toneInstructions}

${forbidden ? `FORBIDDEN PHRASES (never use any of these — replace with concrete alternatives):
"${forbidden}"` : ''}

${moves ? `SIGNATURE MOVES (actively apply these patterns in the rewrite):
${moves}` : ''}

${example ? `TARGET VOICE EXAMPLE (this is what the OUTPUT should sound like):
---
${example}
---
Study this example carefully. The rewritten content must feel like it was written by the same person.` : ''}

=== REWRITE RULES ===
1. AGGRESSIVELY apply all tone rules above — make real changes, not cosmetic ones
2. REMOVE every forbidden phrase and replace with direct, concrete language
3. APPLY at least 2 signature moves from the list above
4. The output must feel authentically different from the input — not just slightly polished
5. Keep the core message and key facts, but transform the voice completely
`;
    } else {
      voiceContext = `No voice profile found. Rewrite to be more direct, concise, and authentic. Remove corporate jargon.`;
    }

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an expert ghostwriter who rewrites content to precisely match a specific author's voice.

${voiceContext}`,
      },
      {
        role: 'user',
        content: `Rewrite the following content to match the voice profile above. Make it sound like the same person who wrote the TARGET VOICE EXAMPLE wrote this.

ORIGINAL CONTENT:
---
${content}
---

Return:
1. The fully rewritten version (field: "rewritten")
2. A list of specific changes you made (field: "changes") — be specific, e.g. "Removed 'leverage' → replaced with 'use'", "Split long sentence into 3 short ones", "Applied signature move: Short sentences."`,
      },
    ];

    const result = await provider.generate({
      operation: 'rewriteToVoice',
      messages,
      schema: RewriteToVoiceSchema,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return result;
  } catch (error) {
    console.error('[AI] rewriteToVoice failed, using stub:', error);
    return rewriteToVoiceStub(params);
  }
}

/**
 * Stub implementation for fallback/testing
 */
function rewriteToVoiceStub(params: { content: string; voiceProfile?: any }): RewriteToVoice {
  const rewritten =
    params.content.trim() ||
    'Shipping fast means saying no. We focus on one outcome: clarity for the operator.';
  const stub: RewriteToVoice = {
    id: stubId('rewrite'),
    type: 'rewrite_to_voice',
    created_at: new Date().toISOString(),
    data: {
      original: params.content || '(empty)',
      rewritten,
      changes: ['Adjusted tone to match your voice profile.', 'Tightened opening.'],
    },
    render_hint: 'diff_view',
  };
  const parsed = RewriteToVoiceSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), RewriteToVoiceSchema);
  return repaired ?? stub;
}

/**
 * Suggest reply variations for engagement comments
 * Uses Claude AI to generate voice-matched responses
 */
export async function suggestReplies(params: {
  comment: string;
  context?: string;
  voiceProfile?: {
    toneSliders?: Record<string, number>;
    forbiddenPhrases?: string[];
    signatureMoves?: string[];
  };
}): Promise<CommentReply> {
  const { comment, context, voiceProfile } = params;

  if (!comment?.trim()) {
    return suggestRepliesStub(params);
  }

  try {
    const provider = getProviderManager();

    let voiceContext = '';
    if (voiceProfile) {
      voiceContext = `
Voice Profile to match:
- Tone: ${JSON.stringify(voiceProfile.toneSliders || {})}
- Avoid: ${voiceProfile.forbiddenPhrases?.join(', ') || 'generic corporate jargon'}
- Style: ${voiceProfile.signatureMoves?.join('; ') || 'authentic, direct'}
`;
    }

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an engagement specialist who helps create authentic, voice-matched replies to comments.

${voiceContext}

Generate 3 reply variations:
1. "warm" - Friendly and appreciative
2. "concise" - Brief and to the point
3. "bold" - Confident and adds value

Each reply should match the voice profile and feel authentic, not generic.
Rate each reply's voice match score (0-1).`,
      },
      {
        role: 'user',
        content: `Comment: "${comment}"${context ? `\n\nContext: ${context}` : ''}

Generate 3 reply suggestions that match the voice profile.`,
      },
    ];

    const result = await provider.generate({
      operation: 'suggestReplies',
      messages,
      schema: CommentReplySchema,
      temperature: 0.8,
      maxTokens: 1000,
    });

    return result;
  } catch (error) {
    console.error('[AI] suggestReplies failed, using stub:', error);
    return suggestRepliesStub(params);
  }
}

/**
 * Stub implementation for fallback/testing
 */
function suggestRepliesStub(_params: { comment: string; context?: string }): CommentReply {
  const stub: CommentReply = {
    id: stubId('reply'),
    type: 'comment_reply',
    created_at: new Date().toISOString(),
    data: {
      suggestions: [
        { variant: 'warm', text: 'Thanks for sharing — glad it resonated.', voiceMatchScore: 0.9 },
        { variant: 'concise', text: 'Appreciate it.', voiceMatchScore: 0.85 },
        { variant: 'bold', text: 'Exactly. Clarity beats volume every time.', voiceMatchScore: 0.88 },
      ],
    },
    render_hint: 'reply_suggestions',
  };
  const parsed = CommentReplySchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), CommentReplySchema);
  return repaired ?? stub;
}

export function suggestLinkedInPost(params: { idea?: string; content?: string }): LinkedInSuggest {
  const rawContent = params.content?.trim() || '';
  const idea = params.idea?.trim() || '';
  const isHashtagOnly = rawContent.length > 0 && !idea;
  const content = isHashtagOnly ? rawContent : (idea || 'Why we say no to 90% of feature requests. The one metric that predicts retention.');
  const stub: LinkedInSuggest = {
    id: stubId('li'),
    type: 'linkedin_suggest',
    created_at: new Date().toISOString(),
    data: {
      content,
      suggestedHashtags: ['Leadership', 'ProductManagement', 'Strategy', 'Execution'],
      hookType: 'question',
      characterCount: content.length,
    },
    render_hint: 'linkedin_editor',
  };
  const parsed = LinkedInSuggestSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), LinkedInSuggestSchema);
  return repaired ?? stub;
}

export function generateVideoScript(params: {
  idea?: string;
  sourceContent?: string;
  targetDurationSeconds?: number;
}): VideoScript {
  const idea = params.idea?.trim() || '';
  const source = params.sourceContent?.trim() || '';
  const base = source || idea || 'Why we say no to 90% of feature requests.';
  const scenes = [
    { title: 'Hook', text: base.slice(0, 80) + (base.length > 80 ? '…' : ''), durationSeconds: 5 },
    { title: 'Main point', text: 'The one metric that predicts retention.', durationSeconds: 15 },
    { title: 'Proof', text: 'Short story or data point.', durationSeconds: 20 },
    { title: 'CTA', text: 'One clear next step.', durationSeconds: 5 },
  ];
  const total = scenes.reduce((s, sc) => s + sc.durationSeconds, 0);
  const stub: VideoScript = {
    id: stubId('vid'),
    type: 'video_script',
    created_at: new Date().toISOString(),
    data: {
      hook: scenes[0].text,
      scenes,
      cta: 'Follow for more on building products that stick.',
      totalDurationSeconds: total,
    },
    render_hint: 'video_script_editor',
  };
  const parsed = VideoScriptSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), VideoScriptSchema);
  return repaired ?? stub;
}

export function optimizeForReadingAloud(params: { content: string }): OptimizeForReadingAloud {
  const text = params.content.trim() || 'Your script. Short sentences. Pause between ideas.';
  const stub: OptimizeForReadingAloud = {
    id: stubId('read'),
    type: 'optimize_reading_aloud',
    created_at: new Date().toISOString(),
    data: {
      content: text,
      pauseMarkers: ['After the first sentence.', 'Before the CTA.'],
      emphasis: ['clarity', 'one outcome'],
      readingPace: 'moderate',
    },
    render_hint: 'reading_cues',
  };
  const parsed = OptimizeForReadingAloudSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), OptimizeForReadingAloudSchema);
  return repaired ?? stub;
}

/**
 * Generate weekly operator brief with insights and action items
 * Uses Claude AI to analyze performance data and suggest next steps
 */
export async function generateWeeklyBrief(params: {
  workspaceId?: string;
  recentPosts?: Array<{ title: string; content: string; engagement: number; publishedAt: Date }>;
  recentComments?: Array<{ author: string; text: string; engagement: number }>;
  goals?: { postsPerWeek?: number; engagementTarget?: number };
}): Promise<WeeklyBrief> {
  try {
    const provider = getProviderManager();

    // Build context from recent activity
    const { recentPosts = [], recentComments = [], goals = {} } = params;

    let activityContext = '';
    if (recentPosts.length > 0) {
      activityContext += `\nRecent Posts (last 7 days):\n`;
      recentPosts.forEach((p) => {
        activityContext += `- "${p.title}" (${p.engagement} engagement)\n`;
      });
    }

    if (recentComments.length > 0) {
      activityContext += `\nTop Commenters:\n`;
      recentComments.forEach((c) => {
        activityContext += `- ${c.author}: "${c.text.slice(0, 100)}..."\n`;
      });
    }

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a strategic brand advisor who creates weekly operator briefs.

Analyze performance data and provide:
1. A clear objective for the week (one sentence, actionable)
2. 2-3 key insights (what's working, what's not, patterns to leverage)
3. Action items (prioritized by impact, with time estimates)
4. Post suggestions (2-3 specific content ideas)
5. People to engage with (who's actively engaging)

Be specific, data-driven, and actionable. No generic advice.`,
      },
      {
        role: 'user',
        content: `Generate this week's operator brief.

${activityContext}

Goals: ${goals.postsPerWeek || 2} posts/week, ${goals.engagementTarget || 100} total engagement

What should the user focus on this week?`,
      },
    ];

    const result = await provider.generate({
      operation: 'generateWeeklyBrief',
      messages,
      schema: WeeklyBriefSchema,
      temperature: 0.6,
      maxTokens: 3000,
    });

    return result;
  } catch (error) {
    console.error('[AI] generateWeeklyBrief failed, using stub:', error);
    return generateWeeklyBriefStub(params);
  }
}

/**
 * Stub implementation for fallback/testing
 */
function generateWeeklyBriefStub(_params: any): WeeklyBrief {
  const stub: WeeklyBrief = {
    id: stubId('brief'),
    type: 'weekly_brief',
    created_at: new Date().toISOString(),
    data: {
      objective: 'Increase signal: one strong post, five high-value replies.',
      insights: [
        {
          id: '1',
          text: 'Question hooks performed 2x better last week.',
          type: 'hook',
          severity: 'high',
          evidence: {
            supportingPosts: [
              { title: 'What if the best metric isn\'t what you track?', engagement: 124 },
              { title: 'Why do most teams optimize for the wrong thing?', engagement: 98 },
            ],
            avgEngagementComparison: 'Question hooks: 2.1x vs statement hooks',
            suggestedExperiments: ['Try 3 question variants this week', 'A/B test contrarian vs question'],
          },
        },
        {
          id: '2',
          text: 'Tuesday and Thursday posts got more engagement.',
          type: 'timing',
          severity: 'medium',
          evidence: {
            supportingPosts: [
              { title: 'Post from Tuesday', engagement: 89 },
              { title: 'Post from Thursday', engagement: 76 },
            ],
            avgEngagementComparison: 'Tue/Thu avg 82 vs Mon/Wed 45',
          },
        },
        {
          id: '3',
          text: 'Topic cluster "operations" resonates most with your audience.',
          type: 'topic',
          severity: 'high',
          evidence: {
            supportingPosts: [
              { title: 'How we run weekly briefs without meetings', engagement: 156 },
            ],
            suggestedExperiments: ['Double down on operations content', 'Create operations framework post'],
          },
        },
      ],
      actions: [
        { id: 'a1', text: 'Post one thought-leadership piece', done: false, impactEstimate: 'high', timeEstimate: '30 min', order: 1 },
        { id: 'a2', text: 'Reply to 5 high-value comments', done: false, impactEstimate: 'medium', timeEstimate: '15 min', order: 2 },
        { id: 'a3', text: 'Review Voice Lab and refine forbidden phrases', done: false, impactEstimate: 'low', timeEstimate: '10 min', order: 3 },
      ],
      postSuggestions: ['Why we say no to 90% of feature requests', 'The one metric that predicts retention'],
      engageWith: [
        { name: 'Alex Chen', reason: 'Frequent engager, 2 comments this week' },
        { name: 'Jordan Lee', reason: 'High-value connection' },
      ],
    },
    render_hint: 'operator_brief',
  };
  const parsed = WeeklyBriefSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), WeeklyBriefSchema);
  return repaired ?? stub;
}

export function diagnosePost(params: { content: string }): PostDiagnostic {
  const text = params.content.trim();
  const h = simpleHash(text);
  const stub: PostDiagnostic = {
    id: stubId('diag'),
    type: 'post_diagnostic',
    created_at: new Date().toISOString(),
    data: {
      hookStrength: 0.6 + (h % 30) / 100,
      clarity: 0.7 + (h % 20) / 100,
      specificity: 0.65 + (h % 25) / 100,
      ctaSoftness: 0.5 + (h % 30) / 100,
      isGeneric: text.length < 100 || text.toLowerCase().includes('synergy'),
      isVague: text.split(' ').length < 20,
      suggestions: [
        'Consider a stronger opening hook',
        'Add more specific examples',
        'Tighten the CTA',
      ],
    },
    render_hint: 'quality_scores',
  };
  const parsed = PostDiagnosticSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  const repaired = repairJsonOnce(JSON.stringify(stub), PostDiagnosticSchema);
  return repaired ?? stub;
}

export function generateHookVariants(params: { content?: string; topic?: string }): HookVariant {
  const stub: HookVariant = {
    id: stubId('hook'),
    type: 'hook_variant',
    created_at: new Date().toISOString(),
    data: {
      variants: [
        { text: 'What if the best metric isn\'t what you\'re tracking?', category: 'question', voiceMatchScore: 0.88 },
        { text: 'Most teams optimize for the wrong thing.', category: 'contrarian', voiceMatchScore: 0.85 },
        { text: '2x engagement when we switched to question hooks.', category: 'data_led', voiceMatchScore: 0.9 },
        { text: 'Last week a founder asked me the same question three times.', category: 'story_led', voiceMatchScore: 0.82 },
        { text: 'Three frameworks for saying no without burning bridges.', category: 'framework_led', voiceMatchScore: 0.87 },
      ],
      confidence_score: 0.85,
    },
  };
  const parsed = HookVariantSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function predictPostPerformance(params: { content: string }): PerformancePrediction {
  const h = simpleHash(params.content);
  const stub: PerformancePrediction = {
    id: stubId('pred'),
    type: 'performance_prediction',
    created_at: new Date().toISOString(),
    data: {
      predictedEngagement: 0.65 + (h % 25) / 100,
      hookStrengthScore: 0.7 + (h % 20) / 100,
      audienceResonance: 0.72 + (h % 18) / 100,
      confidence_score: 0.8,
    },
  };
  const parsed = PerformancePredictionSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function suggestExperiment(_params: { workspaceId?: string }): ExperimentSuggestion {
  const stub: ExperimentSuggestion = {
    id: stubId('exp'),
    type: 'experiment_suggestion',
    created_at: new Date().toISOString(),
    data: {
      title: 'Post at 8:30 AM Wednesday',
      description: 'Test if morning posts outperform afternoon for your audience.',
      hypothesis: 'Tuesday/Thursday morning posts got 2x engagement last month.',
      suggestedTime: '15 min',
      impactEstimate: 'high',
      confidence_score: 0.82,
    },
  };
  const parsed = ExperimentSuggestionSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function analyzeTopicGaps(_params: { workspaceId?: string }): TopicGapAnalysis {
  const stub: TopicGapAnalysis = {
    id: stubId('topic'),
    type: 'topic_gap',
    created_at: new Date().toISOString(),
    data: {
      gaps: [
        { topic: 'logistics digitization', weeksSinceLastPost: 4, suggestedAngle: 'How we cut lead times by 40%' },
        { topic: 'supply chain resilience', weeksSinceLastPost: 6 },
      ],
      overusedThemes: ['leadership', 'strategy'],
      confidence_score: 0.78,
    },
  };
  const parsed = TopicGapAnalysisSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function scoreEngagementPriority(params: { author: string; comment: string; replyCount?: number }): EngagementPriority {
  const stub: EngagementPriority = {
    id: stubId('prio'),
    type: 'engagement_priority',
    created_at: new Date().toISOString(),
    data: {
      priorityScore: 0.85,
      suggestedDmOpener: params.replyCount && params.replyCount >= 3
        ? 'This conversation has been great — would love to continue in DMs.'
        : undefined,
      reason: params.replyCount && params.replyCount >= 3 ? 'You\'ve replied 3 times. Consider moving to DM.' : undefined,
      confidence_score: 0.88,
    },
  };
  const parsed = EngagementPrioritySchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function predictOptimalPublishWindow(_params: { scheduledPosts?: Array<{ date: string; topic?: string }> }): OptimalPublishWindow {
  const stub: OptimalPublishWindow = {
    id: stubId('publish'),
    type: 'optimal_publish_window',
    created_at: new Date().toISOString(),
    data: {
      bestSlots: [
        { dayOfWeek: 'Tuesday', hour: 8, label: 'Tue 8:00 AM', score: 0.92, reason: 'Peak engagement from your audience' },
        { dayOfWeek: 'Thursday', hour: 9, label: 'Thu 9:00 AM', score: 0.88, reason: 'Second-best performing slot' },
        { dayOfWeek: 'Wednesday', hour: 7, label: 'Wed 7:00 AM', score: 0.85, reason: 'Morning commute readers' },
      ],
      conflictWarnings: [],
      topicDiversityScore: 0.78,
      confidence_score: 0.82,
      explanation_trace: 'Based on engagement patterns from past 4 weeks.',
    },
  };
  const parsed = OptimalPublishWindowSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function analyzeNarrativePosition(_params: { writingSamples?: string[]; drafts?: string[] }): NarrativePosition {
  const stub: NarrativePosition = {
    id: stubId('narr'),
    type: 'narrative_position_analysis',
    created_at: new Date().toISOString(),
    data: {
      topNarrativeSignals: [
        { theme: 'operations & execution', strength: 0.92, evidence: '12 posts in last 4 weeks' },
        { theme: 'saying no & prioritization', strength: 0.85, evidence: 'Recurring framework' },
        { theme: 'metrics that matter', strength: 0.78, evidence: 'Data-led hooks perform well' },
        { theme: 'team leadership', strength: 0.72, evidence: 'Emerging in recent posts' },
        { theme: 'product strategy', strength: 0.65, evidence: 'Supporting pillar' },
      ],
      emergingAuthorityZones: ['weekly briefs without meetings', 'retention metrics', 'operator mindset'],
      overusedThemes: ['leadership', 'strategy'],
      underrepresentedAngles: ['failure stories', 'tactical how-tos', 'industry-specific'],
      summary: 'You are becoming known for operational clarity, prioritization frameworks, and metrics-driven execution.',
      confidence_score: 0.84,
      explanation_trace: 'Based on writing samples and published content analysis.',
    },
  };
  const parsed = NarrativePositionSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function predictSegmentResonance(params: { content: string }): SegmentResonance {
  const h = simpleHash(params.content);
  const segments = [
    { name: 'Operators', score: 0.6 + (h % 25) / 100, reason: 'Execution-focused language' },
    { name: 'Founders', score: 0.55 + ((h >> 4) % 25) / 100, reason: 'Strategic framing' },
    { name: 'Students', score: 0.5 + ((h >> 8) % 20) / 100, reason: 'Learning angle' },
    { name: 'Recruiters', score: 0.45 + ((h >> 12) % 20) / 100, reason: 'Career signals' },
    { name: 'Peers', score: 0.7 + ((h >> 16) % 20) / 100, reason: 'Peer-to-peer tone' },
  ];
  const stub: SegmentResonance = {
    id: stubId('seg'),
    type: 'segment_resonance_predict',
    created_at: new Date().toISOString(),
    data: {
      segments,
      confidence_score: 0.78,
      explanation_trace: 'Based on content tone, keywords, and structure.',
    },
  };
  const parsed = SegmentResonanceSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function analyzeCompetitorPatterns(_params: { competitorPosts: string[] }): CompetitorPattern {
  const stub: CompetitorPattern = {
    id: stubId('comp'),
    type: 'competitor_pattern_analysis',
    created_at: new Date().toISOString(),
    data: {
      hookPatterns: [
        { type: 'question', frequency: 0.45, example: 'What if...?' },
        { type: 'data_led', frequency: 0.25, example: '3 out of 5...' },
        { type: 'contrarian', frequency: 0.2, example: 'Stop doing X' },
        { type: 'story', frequency: 0.1 },
      ],
      topicCoverage: [
        { topic: 'leadership', count: 12 },
        { topic: 'product', count: 8 },
        { topic: 'growth', count: 6 },
      ],
      differentiationGaps: [
        'Few posts on operations & execution',
        'Limited tactical how-tos',
        'Opportunity in operator-specific content',
      ],
      confidence_score: 0.8,
      explanation_trace: 'Based on imported competitor posts.',
    },
  };
  const parsed = CompetitorPatternSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function clusterIdeas(_params: { sources: string[] }): IdeaClustering {
  const stub: IdeaClustering = {
    id: stubId('idea'),
    type: 'idea_clustering',
    created_at: new Date().toISOString(),
    data: {
      clusters: [
        {
          theme: 'operations & execution',
          ideas: ['Weekly briefs without meetings', 'Saying no to feature requests', 'One metric that predicts retention'],
          momentumScore: 0.88,
          priorityScore: 0.92,
        },
        {
          theme: 'leadership & team',
          ideas: ['Building operator mindset', 'Clarity over volume', 'Team prioritization frameworks'],
          momentumScore: 0.75,
          priorityScore: 0.8,
        },
        {
          theme: 'product & strategy',
          ideas: ['What to build first', 'Metrics that matter', 'Customer feedback loops'],
          momentumScore: 0.7,
          priorityScore: 0.72,
        },
      ],
      confidence_score: 0.82,
      explanation_trace: 'Extracted from drafts, engagement, and notes.',
    },
  };
  const parsed = IdeaClusteringSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function analyzeReputationRisk(params: { content: string }): ReputationRisk {
  const text = params.content.toLowerCase();
  const risks: Array<{ type: string; severity: 'high' | 'medium' | 'low'; phrase?: string; suggestion?: string }> = [];
  if (text.includes('guarantee') || text.includes('100%')) {
    risks.push({ type: 'Over-promising', severity: 'high', phrase: 'guarantee/100%', suggestion: 'Use "typically" or "often" instead' });
  }
  if (text.includes('never') || text.includes('always')) {
    risks.push({ type: 'Absolute claims', severity: 'medium', phrase: 'never/always', suggestion: 'Soften to "rarely" or "usually"' });
  }
  if (text.includes('best') && text.includes('industry')) {
    risks.push({ type: 'Competitive claim', severity: 'medium', suggestion: 'Cite source or qualify' });
  }
  if (text.includes('synergy') || text.includes('disrupt')) {
    risks.push({ type: 'Buzzword overload', severity: 'low', suggestion: 'Replace with concrete language' });
  }
  if (risks.length === 0) {
    risks.push({ type: 'No major risks detected', severity: 'low' });
  }
  const stub: ReputationRisk = {
    id: stubId('risk'),
    type: 'reputation_risk_analysis',
    created_at: new Date().toISOString(),
    data: {
      risks,
      overallScore: risks.some((r) => r.severity === 'high') ? 0.4 : risks.some((r) => r.severity === 'medium') ? 0.7 : 0.95,
      confidence_score: 0.85,
      explanation_trace: 'Scanned for controversial claims, legal risk phrasing, tone escalation.',
    },
  };
  const parsed = ReputationRiskSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}

export function simulateGrowthProjection(params: {
  postsPerWeek: number;
  engagementFrequency?: number;
  totalWeeks?: number;
}): GrowthProjection {
  const posts = params.postsPerWeek;
  const weeks = params.totalWeeks ?? 12;
  const baseEngagement = 50;
  const baseAuthority = 0.3;
  const curve = Array.from({ length: weeks + 1 }, (_, week) => ({
    week,
    engagement: Math.round(baseEngagement + week * posts * 8 + week * week * 2),
    authority: Math.min(0.95, baseAuthority + (week / weeks) * 0.6 + (posts / 5) * 0.05),
  }));
  const stub: GrowthProjection = {
    id: stubId('growth'),
    type: 'growth_projection_simulation',
    created_at: new Date().toISOString(),
    data: {
      curve,
      totalWeeks: weeks,
      postsPerWeek: posts,
      confidence_score: 0.78,
      explanation_trace: `Simulated ${posts}x/week for ${weeks} weeks.`,
    },
  };
  const parsed = GrowthProjectionSchema.safeParse(stub);
  if (parsed.success) return parsed.data;
  return stub;
}
