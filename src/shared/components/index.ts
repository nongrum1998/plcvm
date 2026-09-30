/**
 * Public surface for every shared component.
 *
 * Re-exports the five component groups so feature code can pull any shared
 * component from a single path (`@components`).
 *
 * Group boundaries:
 * - `ui`      — low-level presentational primitives (button, input, dialog…)
 * - `layout`  — structural wrappers (container, headers, keyboard handling)
 * - `common`  — app-flavoured composites used across several features
 * - `screens` — full-screen states and pages
 * - `providers` — React context providers and error boundaries
 */

export * from './common';
export * from './layout';
export * from './providers';
export * from './screens';
export * from './ui';
