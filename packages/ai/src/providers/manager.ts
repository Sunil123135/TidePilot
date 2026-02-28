import type { z } from 'zod';
import type { AIProvider, Message, ProviderType } from './types';
import { RateLimitError, ProviderError } from './types';
import { ClaudeProvider } from './claude';
import { OpenAIProvider } from './openai';
import { MockProvider } from './mock';

/**
 * Provider manager configuration
 */
interface ProviderManagerConfig {
  primaryProvider?: ProviderType;
  fallbackEnabled?: boolean;
  mockMode?: boolean;
  anthropicApiKey?: string;
  openaiApiKey?: string;
}

/**
 * Provider Manager - routes AI requests to appropriate provider
 * Handles fallbacks, rate limiting, and error recovery
 */
export class ProviderManager {
  private providers: Map<ProviderType, AIProvider>;
  private primaryProvider: ProviderType;
  private fallbackEnabled: boolean;
  private mockMode: boolean;

  constructor(config: ProviderManagerConfig = {}) {
    this.providers = new Map();
    this.primaryProvider = config.primaryProvider || 'claude';
    this.fallbackEnabled = config.fallbackEnabled ?? true;
    this.mockMode = config.mockMode ?? false;

    // Initialize providers based on config
    this.initializeProviders(config);
  }

  private initializeProviders(config: ProviderManagerConfig) {
    // Always initialize mock provider
    this.providers.set('mock', new MockProvider());

    // Initialize Claude if API key provided
    if (config.anthropicApiKey) {
      this.providers.set(
        'claude',
        new ClaudeProvider({ apiKey: config.anthropicApiKey })
      );
    }

    // Initialize OpenAI if API key provided
    if (config.openaiApiKey) {
      this.providers.set(
        'openai',
        new OpenAIProvider({ apiKey: config.openaiApiKey })
      );
    }
  }

  /**
   * Generate structured output with automatic fallback
   */
  async generate<T>(params: {
    operation: string;
    messages: Message[];
    schema: z.ZodSchema<T>;
    preferredProvider?: ProviderType;
    temperature?: number;
    maxTokens?: number;
  }): Promise<T> {
    const { operation, messages, schema, preferredProvider, temperature, maxTokens } = params;

    // If mock mode, always use mock provider
    if (this.mockMode) {
      const mockProvider = this.providers.get('mock')!;
      console.log(`[AI] Mock mode enabled - using Mock provider for ${operation}`);
      return mockProvider.generateStructured({ messages, schema, temperature, maxTokens });
    }

    // Determine which provider to use
    const providerType = preferredProvider || this.primaryProvider;
    const provider = this.providers.get(providerType);

    if (!provider) {
      throw new ProviderError(
        `Provider ${providerType} not configured`,
        providerType
      );
    }

    try {
      console.log(`[AI] Using ${provider.getName()} for ${operation}`);
      const result = await provider.generateStructured({
        messages,
        schema,
        temperature,
        maxTokens,
      });
      return result;
    } catch (error) {
      // Handle rate limit errors with fallback
      if (error instanceof RateLimitError) {
        console.warn(
          `[AI] ${provider.getName()} rate limited for ${operation}, retry after ${error.retryAfter}s`
        );

        if (this.fallbackEnabled) {
          return this.fallbackGenerate({
            operation,
            messages,
            schema,
            failedProvider: providerType,
            temperature,
            maxTokens,
          });
        }

        throw error;
      }

      // For other errors, re-throw
      throw error;
    }
  }

  /**
   * Fallback logic when primary provider fails
   */
  private async fallbackGenerate<T>(params: {
    operation: string;
    messages: Message[];
    schema: z.ZodSchema<T>;
    failedProvider: ProviderType;
    temperature?: number;
    maxTokens?: number;
  }): Promise<T> {
    const { operation, messages, schema, failedProvider, temperature, maxTokens } = params;

    // Determine fallback provider
    let fallbackProvider: ProviderType;
    if (failedProvider === 'claude') {
      fallbackProvider = 'openai';
    } else if (failedProvider === 'openai') {
      fallbackProvider = 'claude';
    } else {
      fallbackProvider = 'mock';
    }

    const provider = this.providers.get(fallbackProvider);
    if (!provider) {
      console.warn(
        `[AI] Fallback provider ${fallbackProvider} not configured, using mock`
      );
      const mockProvider = this.providers.get('mock')!;
      return mockProvider.generateStructured({ messages, schema, temperature, maxTokens });
    }

    try {
      console.log(
        `[AI] Fallback: using ${provider.getName()} for ${operation}`
      );
      return await provider.generateStructured({
        messages,
        schema,
        temperature,
        maxTokens,
      });
    } catch (error) {
      // If fallback also fails, use mock as last resort
      console.error(
        `[AI] Fallback provider ${provider.getName()} also failed for ${operation}, using mock`
      );
      const mockProvider = this.providers.get('mock')!;
      return mockProvider.generateStructured({ messages, schema, temperature, maxTokens });
    }
  }

  /**
   * Generate free-form text (less common)
   */
  async generateText(params: {
    operation: string;
    messages: Message[];
    preferredProvider?: ProviderType;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const { operation, messages, preferredProvider, temperature, maxTokens } = params;

    if (this.mockMode) {
      const mockProvider = this.providers.get('mock')!;
      return mockProvider.generateText({ messages, temperature, maxTokens });
    }

    const providerType = preferredProvider || this.primaryProvider;
    const provider = this.providers.get(providerType);

    if (!provider) {
      throw new ProviderError(
        `Provider ${providerType} not configured`,
        providerType
      );
    }

    try {
      console.log(`[AI] Using ${provider.getName()} for ${operation} (text)`);
      return await provider.generateText({ messages, temperature, maxTokens });
    } catch (error) {
      if (error instanceof RateLimitError && this.fallbackEnabled) {
        const fallbackProvider =
          providerType === 'claude' ? 'openai' : 'claude';
        const fallback = this.providers.get(fallbackProvider);

        if (fallback) {
          console.log(`[AI] Fallback: using ${fallback.getName()}`);
          return fallback.generateText({ messages, temperature, maxTokens });
        }
      }

      throw error;
    }
  }
}

// Singleton instance for global use
let globalManager: ProviderManager | null = null;

/**
 * Get or create the global provider manager instance
 */
export function getProviderManager(config?: ProviderManagerConfig): ProviderManager {
  if (!globalManager || config) {
    globalManager = new ProviderManager({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      primaryProvider: (process.env.AI_PRIMARY_PROVIDER as ProviderType) || 'claude',
      fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
      mockMode: process.env.AI_MOCK_MODE === 'true',
      ...config,
    });
  }
  return globalManager;
}
