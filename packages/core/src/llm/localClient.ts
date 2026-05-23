/**
 * @license
 * Copyright 2026 [Your Name/Organization]
 * SPDX-License-Identifier: Apache-2.0
 */

import { type FetchFn } from 'undici';
import { 
  type GenerateContentParameters,
  type GenerateContentResponse,
  type CountTokensParameters,
  type CountTokensResponse,
  type EmbedContentParameters,
  type EmbedContentResponse,
} from '@google/genai';

/**
 * Local model LLM client that implements the LLMClient interface.
 * This client works with local model servers like Ollama that provide an OpenAI-compatible API.
 */
export class LocalClient {
  private baseUrl: string;
  private fetchFn: FetchFn;

  constructor(
    baseUrl: string,
    fetchFn?: FetchFn
  ) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.fetchFn = fetchFn || fetch;
  }

  async generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
    role: string,
  ): Promise<GenerateContentResponse> {
    // Convert Gemini-style request to OpenAI chat completion format (Ollama uses OpenAI API format)
    const { model, contents, config } = request;
    
    // Extract messages from contents
    const messages = this.contentsToMessages(contents);
    
    // Prepare OpenAI request (Ollama compatible)
    const openaiRequest: any = {
      model,
      messages,
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxOutputTokens ?? 2048,
      stream: false,
    };

    // Add top_p if specified
    if (config?.topP !== undefined) {
      openaiRequest.top_p = config.topP;
    }

    // Add stop sequences if specified
    if (config?.stopSequences?.length) {
      openaiRequest.stop = config.stopSequences;
    }

    // Make request to local model API (Ollama format)
    const response = await this.fetchFn(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Local model API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Convert OpenAI response to Gemini format
    return this.openaiResponseToGemini(data, model, userPromptId);
  }

  async *generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
    role: string,
  ): AsyncGenerator<GenerateContentResponse> {
    // Convert Gemini-style request to OpenAI chat completion format
    const { model, contents, config } = request;
    
    // Extract messages from contents
    const messages = this.contentsToMessages(contents);
    
    // Prepare OpenAI request (Ollama compatible)
    const openaiRequest: any = {
      model,
      messages,
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxOutputTokens ?? 2048,
      stream: true,
    };

    // Add top_p if specified
    if (config?.topP !== undefined) {
      openaiRequest.top_p = config.topP;
    }

    // Add stop sequences if specified
    if (config?.stopSequences?.length) {
      openaiRequest.stop = config.stopSequences;
    }

    // Make streaming request to local model API
    const response = await this.fetchFn(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Local model API error: ${response.status} ${errorText}`);
    }

    // Process streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        
        const dataStr = line.slice(5);
        if (dataStr === '[DONE]') continue;

        try {
          const data = JSON.parse(dataStr);
          const geminiResponse = this.openaiStreamResponseToGemini(data, model, userPromptId);
          if (geminiResponse) {
            yield geminiResponse;
          }
        } catch (e) {
          // Ignore parsing errors on individual lines
          continue;
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer.slice(5));
        if (data !== '[DONE]') {
          const geminiResponse = this.openaiStreamResponseToGemini(data, model, userPromptId);
          if (geminiResponse) {
            yield geminiResponse;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }

  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    // For simplicity, we'll estimate tokens based on character count
    // A more accurate implementation would use the model's tokenizer via an API call if available
    const { contents } = request;
    const text = this.contentsToText(contents);
    const estimatedTokens = Math.ceil(text.length / 4); // Rough estimate: 4 chars per token
    
    return {
      totalTokens: estimatedTokens,
    };
  }

  async embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    const { model, contents } = request;
    const text = this.contentsToText(contents);
    
    // Try the embeddings endpoint first (if available)
    try {
      const response = await this.fetchFn(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert to Gemini embedding response format
        return {
          embeddings: [{
            values: data.data[0].embedding,
          }],
        };
      }
      // If embeddings endpoint not available, fall back to estimating
    } catch (e) {
      // Fall through to estimation
    }
    
    // Fallback: estimate embedding as a fixed-size vector
    // This is not useful for actual semantic search but maintains interface compatibility
    const embeddingSize = 768; // Common embedding size
    const estimatedEmbedding = new Array(embeddingSize).fill(0.1);
    
    return {
      embeddings: [{
        values: estimatedEmbedding,
      }],
    };
  }

  // Helper methods to convert between formats
  
  private contentsToMessages(contents: any[]): any[] {
    return contents.map(content => {
      if (content.role === 'user') {
        return {
          role: 'user',
          content: this.partsToText(content.parts || []),
        };
      } else if (content.role === 'model') {
        return {
          role: 'assistant',
          content: this.partsToText(content.parts || []),
        };
      } else {
        // Default to user for unknown roles
        return {
          role: 'user',
          content: this.partsToText(content.parts || []),
        };
      }
    });
  }

  private partsToText(parts: any[]): string {
    return parts
      .map(part => {
        if ('text' in part) {
          return part.text;
        }
        // For now, ignore non-text parts (images, etc.) in the local client
        // A more complete implementation would handle multimodal inputs
        return '';
      })
      .join('\n');
  }

  private contentsToText(contents: any[]): string {
    return contents
      .map(content => this.partsToText(content.parts || []))
      .join('\n');
  }

  private openaiResponseToGemini(openaiResponse: any, model: string, userPromptId: string): GenerateContentResponse {
    const choice = openaiResponse.choices[0];
    const message = choice.message;
    
    return {
      model,
      responseId: openaiResponse.id ?? userPromptId,
      candidates: [{
        content: {
          role: 'model',
          parts: [{
            text: message.content || '',
          }],
        },
        finishReason: this.mapFinishReason(choice.finish_reason),
        index: 0,
      }],
      usageMetadata: {
        promptTokenCount: openaiResponse.usage?.prompt_tokens ?? 0,
        candidatesTokenCount: openaiResponse.usage?.completion_tokens ?? 0,
        totalTokenCount: openaiResponse.usage?.total_tokens ?? 0,
      },
    };
  }

  private openaiStreamResponseToGemini(openaiResponse: any, model: string, userPromptId: string): GenerateContentResponse | null {
    if (!openaiResponse.choices || openaiResponse.choices.length === 0) {
      return null;
    }
    
    const choice = openaiResponse.choices[0];
    const delta = choice.delta;
    
    // If this is just a completion chunk with no content, return null
    if (!delta.content && !choice.finish_reason) {
      return null;
    }
    
    return {
      model,
      responseId: openaiResponse.id ?? userPromptId,
      candidates: [{
        content: {
          role: 'model',
          parts: [{
            text: delta.content || '',
          }],
        },
        finishReason: choice.finish_reason ? this.mapFinishReason(choice.finish_reason) : undefined,
        index: 0,
      }],
      usageMetadata: {
        promptTokenCount: openaiResponse.usage?.prompt_tokens ?? 0,
        candidatesTokenCount: openaiResponse.usage?.completion_tokens ?? 0,
        totalTokenCount: openaiResponse.usage?.total_tokens ?? 0,
      },
    };
  }

  private mapFinishReason(finishReason: string | null): string | null {
    switch (finishReason) {
      case 'stop':
        return 'STOP';
      case 'length':
        return 'MAX_TOKENS';
      case 'tool_calls':
        return 'TOOL_CALLS';
      case 'content_filter':
        return 'SAFETY';
      case null:
        return null;
      default:
        return 'OTHER';
    }
  }
}