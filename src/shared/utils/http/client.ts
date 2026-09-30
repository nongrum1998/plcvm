import { API_BASE_URL } from './constants';
import { createApi } from '@api';
import { encryptReqBody, attachReqHeaderAccessToken } from './request';
import { decryptRequestResponse } from './decrypt-response';
import { captureAccessTokenFromLogin, handleErrorResponse } from './response';
/**
 * Configured Axios instance for application-wide API requests.
 * Includes base URL, credentials support, default JSON headers,
 * and interceptors for auth token injection and automatic token refresh.
 */
const apiClient = createApi({
  baseURL: API_BASE_URL,
  interceptors: {
    request: [
      {
        onFulfilled: attachReqHeaderAccessToken(),
      },
      {
        onFulfilled: encryptReqBody(),
      },
    ],
    response: [
      {
        onFulfilled: decryptRequestResponse,
      },
      {
        onFulfilled: captureAccessTokenFromLogin,
      },
      {
        onRejected: handleErrorResponse(),
      },
    ],
  },
});

export default apiClient.client;

const http = apiClient.http;

export { apiClient, http };
