/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type AuthType,
  type Config,
  getErrorMessage,
  ValidationRequiredError,
  isAccountSuspendedError,
  ProjectIdRequiredError,
} from '@google/gemini-cli-core';

import type { AccountSuspensionInfo } from '../ui/contexts/UIStateContext.js';

export interface InitialAuthResult {
  authError: string | null;
  accountSuspensionInfo: AccountSuspensionInfo | null;
}

/**
 * Resolves the effective AuthType from the provider setting and selected auth type.
 * When the provider is explicitly set to 'openai' or 'local', the corresponding
 * AuthType is returned regardless of selectedType.
 * @param provider The LLM provider setting ('gemini', 'openai', or 'local').
 * @param selectedType The auth type selected in settings.
 * @returns The resolved AuthType, or undefined if neither is set.
 */
export function resolveAuthType(
  provider: string | undefined,
  selectedType: AuthType | undefined,
): AuthType | undefined {
  if (provider === 'openai') {
    return AuthType.USE_OPENAI;
  }
  if (provider === 'local') {
    return AuthType.USE_LOCAL;
  }
  return selectedType;
}

/**
 * Handles the initial authentication flow.
 * @param config The application config.
 * @param authType The selected auth type.
 * @returns The auth result with error message and account suspension status.
 */
export async function performInitialAuth(
  config: Config,
  authType: AuthType | undefined,
  apiKey?: string,
  baseUrl?: string,
): Promise<InitialAuthResult> {
  if (!authType) {
    return { authError: null, accountSuspensionInfo: null };
  }

  try {
    await config.refreshAuth(authType, apiKey, baseUrl);
    // The console.log is intentionally left out here.
    // We can add a dedicated startup message later if needed.
  } catch (e) {
    if (e instanceof ValidationRequiredError) {
      // Don't treat validation required as a fatal auth error during startup.
      // This allows the React UI to load and show the ValidationDialog.
      return { authError: null, accountSuspensionInfo: null };
    }
    const suspendedError = isAccountSuspendedError(e);
    if (suspendedError) {
      return {
        authError: null,
        accountSuspensionInfo: {
          message: suspendedError.message,
          appealUrl: suspendedError.appealUrl,
          appealLinkText: suspendedError.appealLinkText,
        },
      };
    }
    if (e instanceof ProjectIdRequiredError) {
      // OAuth succeeded but account setup requires project ID
      // Show the error message directly without "Failed to login" prefix
      return {
        authError: getErrorMessage(e),
        accountSuspensionInfo: null,
      };
    }
    return {
      authError: `Failed to sign in. Message: ${getErrorMessage(e)}`,
      accountSuspensionInfo: null,
    };
  }

  return { authError: null, accountSuspensionInfo: null };
}
