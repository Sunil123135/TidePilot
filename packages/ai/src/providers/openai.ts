import OpenAI from 'openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { z } from 'zod';
import type { AIProvider, Message, ProviderConfig } from './types';
import { ProviderError, RateLimitError, ValidationError } from './types';

/**
 * OpenAI provider using OpenAI SDK
 * Uses JSON mode + schema validation for structured outputs
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
    });
    this.model = config.model || 'gpt-4-turbo-preview';
  }

  getName(): string {
    return 'OpenAI';
  }

  /**
   * Generate structured output using JSON mode
   */
  async generateStructured<T>(params: {
    messages: Message[];
    schema: z.ZodSchema<T>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<T> {
    try {
      const { messages, schema, temperature = 0.7, maxTokens = 4096 } = params;

      // Convert Zod schema to JSON schema for prompt
      const jsonSchema = zodToJsonSchema(schema, 'response');

      // Add schema instruction to system message
      const messagesWithSchema: OpenAI.ChatCompletionMessageParam[] = messages.map(
        (m) => {
          if (m.role === 'system') {
            return {
              role: 'system',
              content: `${m.content}\n\nRespond with JSON matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}`,
            };
          }
          return {
            role: m.role,
            content: m.content,
          } as OpenAI.ChatCompletionMessageParam;
        }
      );

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messagesWithSchema,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new ProviderError('OpenAI returned empty response', 'openai');
      }

      // Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        throw new ProviderError(
          `OpenAI returned invalid JSON: ${content}`,
          'openai'
        );
      }

      // Validate against schema
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new ValidationError(
          'OpenAI output failed schema validation',
          result.error.issues
        );
      }

      return result.data;
    } catch (error: any) {
      // Handle rate limits
      if (error.status === 429 || error.code === 'rate_limit_exceeded') {
        throw new RateLimitError('OpenAI API rate limit exceeded');
      }

      // Handle other API errors
      if (error instanceof OpenAI.APIError) {
        throw new ProviderError(
          `OpenAI API error: ${error.message}`,
          'openai',
          error.status?.toString()
        );
      }

      // Re-throw our custom errors
      if (
        error instanceof ValidationError ||
        error instanceof ProviderError
      ) {
        throw error;
      }

      // Unknown error
      throw new ProviderError(
        `Unexpected error from OpenAI: ${error.message}`,
        'openai'
      );
    }
  }

  /**
   * Generate free-form text
   */
  async generateText(params: {
    messages: Message[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      const { messages, temperature = 0.7, maxTokens = 4096 } = params;

      const openaiMessages: OpenAI.ChatCompletionMessageParam[] = messages.map(
        (m) =>
          ({
            role: m.role,
            content: m.content,
          } as OpenAI.ChatCompletionMessageParam)
      );

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: openaiMessages,
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new ProviderError('OpenAI returned empty response', 'openai');
      }

      return content;
    } catch (error: any) {
      if (error.status === 429) {
        throw new RateLimitError('OpenAI API rate limit exceeded');
      }

      if (error instanceof OpenAI.APIError) {
        throw new ProviderError(
          `OpenAI API error: ${error.message}`,
          'openai'
        );
      }

      throw new ProviderError(
        `Unexpected error from OpenAI: ${error.message}`,
        'openai'
      );
    }
  }
}
