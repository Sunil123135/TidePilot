import type { z } from 'zod';
import type { AIProvider, Message } from './types';

/**
 * Mock provider for testing - returns deterministic responses
 * Useful when AI_MOCK_MODE=true to avoid API costs during development
 */
export class MockProvider implements AIProvider {
  getName(): string {
    return 'Mock';
  }

  /**
   * Returns a minimal valid object matching the schema
   */
  async generateStructured<T>(params: {
    messages: Message[];
    schema: z.ZodSchema<T>;
    temperature?: number;
    maxTokens?: number;
  }): Promise<T> {
    const { schema } = params;

    // Generate a mock object based on schema structure
    // This is a simple implementation - for more complex schemas,
    // you might want to use a library like @anatine/zod-mock
    const mockData = this.generateMockFromSchema(schema);

    // Validate to ensure it matches
    const result = schema.safeParse(mockData);
    if (result.success) {
      return result.data;
    }

    // If validation fails, throw - this indicates the mock needs updating
    throw new Error(
      `Mock provider failed to generate valid data for schema: ${JSON.stringify(result.error.issues)}`
    );
  }

  /**
   * Returns generic mock text
   */
  async generateText(params: {
    messages: Message[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    return 'This is a mock response from the Mock provider. Set AI_MOCK_MODE=false to use real AI.';
  }

  /**
   * Simple mock data generator based on schema
   * In production, use a proper mock generator library
   */
  private generateMockFromSchema(schema: z.ZodSchema<any>): any {
    // For now, return a basic mock structure
    // This should be enhanced with actual schema parsing
    return {
      id: `mock_${Date.now()}`,
      type: 'mock_response',
      created_at: new Date().toISOString(),
      data: {
        // Basic mock data
        content: 'Mock content',
        suggestions: ['Mock suggestion 1', 'Mock suggestion 2'],
      },
    };
  }
}
