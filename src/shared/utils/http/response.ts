/**
 * @file Axios response interceptor — login token capture and auth-path handling. On successful responses it captures the access token returned by the login endpoint. On errors it lets auth-path failures pass through to the caller (login/logout never trigger token machinery) and purges stored tokens when
 * the `/user` endpoint fails. There is intentionally no 401 token refresh:
 * the old refresh/retry machinery was never wired in and has been removed.
 */

import type { AxiosError, AxiosResponse } from 'axios';

import { TokenStoreManager } from '@stores/token.store';
import { ENDPOINTS } from '@utils/constants/endpoints';

import { isAuthPath } from './constants';
import { logger } from '@utils';

/** Shape of a login response body: `{ data: { token } }` when successful. */
type LoginResponseBody = {
  token?: string;
};

/**
 * Captures the access token from a successful login response.
 *
 * Runs on every fulfilled response but only touches the secure store when the
 * request targets {@link ENDPOINTS.AUTH.LOGIN} with status 200 and a body
 * containing `data.token`. Rejects when the secure store write fails so the
 * caller sees the storage error.
 *
 * @param response - The Axios response object.
 * @returns The original response, after any token capture.
 */
export async function captureAccessTokenFromLogin(response: AxiosResponse): Promise<AxiosResponse> {
  const requestUrl = response.config.url || '';

  if (response.status !== 200 || requestUrl !== ENDPOINTS.AUTH.LOGIN || !response.data) {
    return response;
  }

  const data = response.data as LoginResponseBody;
  const token = data.token;

  if (!token) {
    return response;
  }

  try {
    await TokenStoreManager.addAccessToken(token);
  } catch (error) {
    return Promise.reject(error);
  }

  return response;
}

/**
 * Creates the Axios response interceptor pair for `axios.interceptors.response.use()`.
 *
 * Fulfilled handler: captures the login token. Rejected handler: purges stored
 * tokens when the `/user` endpoint fails, resolves auth-path errors with the
 * raw error response (so the wrapper can normalise them), and rejects
 * everything else unchanged.
 *
 * @returns A pair of [onFulfilled, onRejected] handlers.
 */
export const handleErrorResponse = () => {
  return async (error: AxiosError) => {
    if (__DEV__) {
      console.log(
        'Request Error =>',
        JSON.stringify(
          {
            method: error?.config?.method,
            url: error?.config?.url,
            status: error?.status,
          },
          null,
          2
        )
      );
    }

    if (!error.config) {
      return Promise.reject(error);
    }

    const requestPath = error.config.url ?? '';

    if (requestPath !== ENDPOINTS.AUTH.USER && error.status === 401) {
      logger.info('Auth Error: Removing tokens');
      await TokenStoreManager.removeTokens();
    }

    if (isAuthPath(requestPath)) {
      if (error.response) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  };
};
