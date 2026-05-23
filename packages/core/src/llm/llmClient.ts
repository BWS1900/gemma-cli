/**
 * @license
 * Copyright 2026 [Your Name/Organization]
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type GenerateContentParameters,
  type GenerateContentResponse,
  type CountTokensParameters,
  type CountTokensResponse,
  type EmbedContentParameters,
  type EmbedContentResponse,
} from '@google/genai';

/**
 * Interface for LLM clients that can generate content, count tokens, and embed content.
 */
export interface LLMClient {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
    role: string,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
    role: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  // Optional: any additional methods or properties specific to the client
  // For example, we might want to expose the model name or other config.
}