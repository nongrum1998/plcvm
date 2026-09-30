import { useSegments } from 'expo-router';

/**
 * Returns the current route path by reading Expo Router's segment tree and
 * filtering out route-group segments (those wrapped in parentheses, e.g.
 * `(auth)`, `(tabs)`).
 *
 * This is useful anywhere you need a clean, absolute path string — such as
 * matching against route-based configuration maps.
 *
 * @returns The cleaned route path, e.g. `"/employees/123"` or `"/settings"`.
 *
 * @example
 * ```tsx
 * const path = useRoutePath();
 * // path === '/employees/abc-123'
 * ```
 */
export function useRoutePath(): string {
  const segments = useSegments();
  const filtered = segments.filter((s) => !s.startsWith('(') && !s.startsWith(')'));
  return '/' + filtered.join('/');
}
