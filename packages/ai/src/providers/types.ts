import type { z } from 'zod';

/**
 * Message structure for LLM conversations
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for AI generation
 */
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * AI Provider interface - all providers must implement this
 */
export interface AIProvider {
  /**
   * Generate structured output matching a Zod schema
   */
  generateStructured<T>(params: {
    messages: Message[];
    schema: z.ZodSchema<T>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<T>;

  /**
   * Generate free-form text response
   */
  generateText(params: {
    messages: Message[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<string>;

  /**
   * Provider name for logging
   */
  getName(): string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey: string;
  model?: string;
  timeout?: number;
}

/**
 * Provider type identifier
 */
export type ProviderType = 'claude' | 'openai' | 'mock';

/**
 * Error classes for provider operations
 */
export class RateLimitError extends Error {
  constructor(message: string, public retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ProviderError extends Error {
  constructor(message: string, public provider: string, public code?: string) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public validationIssues?: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}
