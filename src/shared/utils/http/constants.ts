/**
 * @file Shared HTTP client constants.
 *
 * Defines the API base URL, authentication path list, and a helper to
 * check whether a URL targets an auth endpoint (bypassing token refresh).
 */

/**
 * Base URL for the API.
 * Defaults to localhost if `EXPO_PUBLIC_API_URL` is not provided.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL as string;

/**
 * Paths that bypass the automatic token refresh logic.
 * Errors on these paths are returned directly to the caller.
 *
 * These must be kept in sync with {@link ENDPOINTS.AUTH} — they are matched
 * against `originalRequest.url` (e.g. `/login/`), which is why the values
 * include their leading/trailing slashes.
 */
export const AUTH_PATHS = ['/login', '/logout', '/user'] as const;

/**
 * Checks if a given URL is one of the authentication-related paths.
 *
 * @param url - The URL to check.
 * @returns True if the URL is an auth path, false otherwise.
 */
export const isAuthPath = (url: string): boolean => {
  return AUTH_PATHS.some((path) => url.includes(path));
};
