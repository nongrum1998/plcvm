import type { PageHeaderConfig, PageHeader } from '@sharedTypes';

/**
 * Matches a route path against the `PAGE_HEADERS` configuration registry.
 *
 * The lookup works in two phases:
 * 1. **Exact match** — the path is looked up directly in the config object.
 * 2. **Dynamic-route fallback** — keys containing `[param]` segments are
 *    converted to regex patterns and tested against the path. Keys with more
 *    segments are tried first (longest-match-wins).
 *
 * @param path - The route path to match (e.g. `/employees/abc-123`).
 * @returns The matching {@link PageHeaderConfig}, or `null` when no entry
 * exists for the given path.
 *
 * @example
 * ```ts
 * matchPageHeader('/');               // => { title: 'Home', showDrawer: true }
 * matchPageHeader('/employees/abc');  // => { title: 'Employee Details', showBackButton: true }
 * matchPageHeader('/unknown');        // => null
 * ```
 */

export function matchPageHeader(path: string, PAGE_HEADERS: PageHeader): PageHeaderConfig | null {
  if (PAGE_HEADERS[path as keyof typeof PAGE_HEADERS])
    return PAGE_HEADERS[path as keyof typeof PAGE_HEADERS]!;

  const keys = Object.keys(PAGE_HEADERS).sort((a, b) => b.split('/').length - a.split('/').length);

  for (const key of keys) {
    if (!key.includes('[')) continue;
    const pattern = key.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(path)) return PAGE_HEADERS[key as keyof typeof PAGE_HEADERS]!;
  }

  return null;
}
