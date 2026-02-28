import Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { z } from 'zod';
import type { AIProvider, Message, ProviderConfig } from './types';
import { ProviderError, RateLimitError, ValidationError } from './types';

/**
 * Claude provider using Anthropic SDK
 * Uses tool calling for structured outputs
 */
export class ClaudeProvider implements AIProvider {
  private client: Anthropic;
  private model: string;
  private timeout: number;

  constructor(config: ProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
    });
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.timeout = config.timeout || 30000;
  }

  getName(): string {
    return 'Claude';
  }

  /**
   * Generate structured output using tool calling
   * Claude's structured output approach: use tools with JSON schema
   */
  async generateStructured<T>(params: {
    messages: Message[];
    schema: z.ZodSchema<T>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<T> {
    try {
      const { messages, schema, temperature = 0.7, maxTokens = 4096 } = params;

      // Convert Zod schema to JSON schema for tool definition
      const jsonSchema = zodToJsonSchema(schema, 'response');

      // Separate system messages from conversation
      const systemMessages = messages.filter((m) => m.role === 'system');
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      // Claude expects specific message format
      const claudeMessages = conversationMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // Use tool calling for structured output
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessages.map((m) => m.content).join('\n') || undefined,
        messages: claudeMessages,
        tools: [
          {
            name: 'provide_structured_output',
            description: 'Provide response in the required structured format',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            input_schema: (jsonSchema.definitions?.response || jsonSchema) as any,
          },
        ],
        tool_choice: { type: 'tool', name: 'provide_structured_output' },
      });

      // Extract tool use from response
      const toolUseBlock = response.content.find(
        (block) => block.type === 'tool_use'
      );

      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        throw new ProviderError(
          'Claude did not return structured output',
          'claude'
        );
      }

      // Validate against schema
      const result = schema.safeParse(toolUseBlock.input);
      if (!result.success) {
        throw new ValidationError(
          'Claude output failed schema validation',
          result.error.issues
        );
      }

      return result.data;
    } catch (error: any) {
      // Handle rate limits
      if (error.status === 429) {
        const retryAfter = parseInt(error.headers?.['retry-after'] || '60', 10);
        throw new RateLimitError(
          'Claude API rate limit exceeded',
          retryAfter
        );
      }

      // Handle other API errors
      if (error instanceof Anthropic.APIError) {
        throw new ProviderError(
          `Claude API error: ${error.message}`,
          'claude',
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
        `Unexpected error from Claude: ${error.message}`,
        'claude'
      );
    }
  }

  /**
   * Generate free-form text (no structured output)
   */
  async generateText(params: {
    messages: Message[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      const { messages, temperature = 0.7, maxTokens = 4096 } = params;

      const systemMessages = messages.filter((m) => m.role === 'system');
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      const claudeMessages = conversationMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessages.map((m) => m.content).join('\n') || undefined,
        messages: claudeMessages,
      });

      // Extract text from response
      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new ProviderError('Claude did not return text', 'claude');
      }

      return textBlock.text;
    } catch (error: any) {
      if (error.status === 429) {
        throw new RateLimitError('Claude API rate limit exceeded');
      }

      if (error instanceof Anthropic.APIError) {
        throw new ProviderError(
          `Claude API error: ${error.message}`,
          'claude'
        );
      }

      throw new ProviderError(
        `Unexpected error from Claude: ${error.message}`,
        'claude'
      );
    }
  }
}
