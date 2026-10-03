/**
 * @file Axios request interceptor — attaches the access token and encrypts
 * request payloads.
 *
 * Adds the Bearer access token to outgoing requests when available.
 * Plain-object request bodies are automatically encrypted and wrapped with
 * the required payload format. Pre-serialized request bodies are passed
 * through unchanged.
 */

import { encryptFields } from '@lib/encryption/transform';
import { TokenStoreManager } from '@stores/token.store';
import type { InternalAxiosRequestConfig } from 'axios';

/**
 * Creates the Axios request interceptor that attaches the access token
 * and encrypts eligible request bodies.
 *
 * Body handling:
 * - Plain-object bodies are automatically encrypted.
 * - Pre-serialized bodies such as strings, URLSearchParams, and FormData
 *   are passed through unchanged.
 *
 * This prevents double-encrypting payloads and allows callers to control
 * the exact wire format when required, such as for
 * `application/x-www-form-urlencoded` requests.
 *
 * @returns The Axios request interceptor function.
 *
 * @example
 * ```ts
 * apiClient.interceptors.request.use(encryptReqBody());
 * ```
 */
export const encryptReqBody = () => {
  return async (config: InternalAxiosRequestConfig) => {
    if (
      config.data &&
      typeof config.data === 'object' &&
      !(config.data instanceof FormData) &&
      !(config.data instanceof URLSearchParams)
    ) {
      config.data = await encryptFields({
        payload: JSON.stringify(config.data),
      });
    }
    return config;
  };
};

export const attachReqHeaderAccessToken = () => {
  return async (config: InternalAxiosRequestConfig) => {
    const accessToken = await TokenStoreManager.getAccessToken();

    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  };
};
