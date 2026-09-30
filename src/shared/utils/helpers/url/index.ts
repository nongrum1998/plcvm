/**
 * @file URL building utilities.
 *
 * Provides helpers for constructing URLs with query parameters,
 * supporting both absolute and relative URLs with null-value filtering.
 */

/**
 * Builds a URL with query parameters.
 *
 * Handles both absolute and relative URLs. Existing query parameters
 * are overwritten by matching keys in the `query` object. `null` and
 * `undefined` values are filtered out.
 *
 * @param url   - The base URL (absolute or relative).
 * @param query - Key-value pairs to append as query parameters.
 * @returns The URL with query parameters appended.
 *
 * @example
 * ```ts
 * buildUrlWithQuery("/api/users", { page: 2, limit: 20 })
 * // "/api/users?page=2&limit=20"
 *
 * buildUrlWithQuery("https://api.example.com/users", { search: "alice" })
 * // "https://api.example.com/users?search=alice"
 * ```
 */
export function buildUrlWithQuery(
  url: string,
  query: Record<string, string | number | boolean | null | undefined>
): string {
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
  const dummyBase = 'http://localhost';
  const urlObj = new URL(url, isAbsolute ? undefined : dummyBase);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlObj.searchParams.set(key, String(value));
    }
  });

  if (isAbsolute) {
    return urlObj.toString();
  }

  const searchAndHash = urlObj.search + urlObj.hash;
  const originalHadLeadingSlash = url.startsWith('/');

  if (!originalHadLeadingSlash && urlObj.pathname.startsWith('/')) {
    return urlObj.pathname.substring(1) + searchAndHash;
  }

  return urlObj.pathname + searchAndHash;
}
