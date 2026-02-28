/**
 * AI Provider System
 *
 * Multi-provider abstraction layer for TidePilot AI features.
 * Supports Claude (primary), OpenAI (fallback), and Mock (testing).
 *
 * @example
 * ```typescript
 * import { getProviderManager } from './providers';
 *
 * const manager = getProviderManager();
 * const result = await manager.generate({
 *   operation: 'extractVoiceProfile',
 *   messages: [...],
 *   schema: VoiceProfileSchema,
 *   preferredProvider: 'claude',
 * });
 * ```
 */

export { ClaudeProvider } from './claude';
export { OpenAIProvider } from './openai';
export { MockProvider } from './mock';
export { ProviderManager, getProviderManager } from './manager';
export type {
  AIProvider,
  Message,
  ProviderConfig,
  ProviderType,
  GenerationOptions,
} from './types';
export {
  RateLimitError,
  ProviderError,
  ValidationError,
} from './types';
