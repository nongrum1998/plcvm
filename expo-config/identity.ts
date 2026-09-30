/**
 * @file Per-app identity resolution.
 *
 * Maps a spec plus a build variant onto the concrete identity fields Expo
 * needs: display name, scheme, and bundle identifiers.
 *
 * The naming is deliberately asymmetric and matches what the workspace apps
 * have always produced: display names get a *bracketed* suffix
 * (`CPPS [dev]`, `CPPS [Preview]`) while schemes get a *hyphenated* one
 * (`cpps-dev`, `cpps-preview`). Changing that would alter deep links and
 * home-screen labels, so it is preserved exactly.
 *
 * Schemes derive from `AppSpec.scheme`, which is a field in its own right and
 * not a stand-in for `AppSpec.slug` — the two genuinely differ for `cpps`
 * (`slug: 'cssp'`, `scheme: 'cpps'`).
 */

import type { AppSpec, AppVariant, ResolvedIdentity } from './types';

/**
 * Builds the home-screen display name for a variant.
 *
 * `development` and `preview` are labelled so a side-by-side install is
 * self-identifying; `production` is the bare product name.
 *
 * @param appName - Base name from the spec, e.g. `CPPS`.
 * @param variant - Resolved build variant.
 * @returns `CPPS [dev]`, `CPPS [Preview]`, or `CPPS`.
 *
 * @example
 * ```ts
 * resolveAppName('CPPS', 'preview'); // 'CPPS [Preview]'
 * ```
 */
export function resolveAppName(appName: string, variant: AppVariant): string {
  switch (variant) {
    case 'development':
      return `${appName} [dev]`;
    case 'preview':
      return `${appName} [Preview]`;
    case 'production':
      return appName;
  }
}

/**
 * Builds the deep-link URL scheme for a variant.
 *
 * Derives from the spec's `scheme` field rather than its `slug`, because the
 * two can differ and the scheme is what external links actually use.
 *
 * @param base - Base scheme from the spec, e.g. `cpps`.
 * @param variant - Resolved build variant.
 * @returns `cpps-dev`, `cpps-preview`, or `cpps`.
 *
 * @example
 * ```ts
 * resolveScheme('cpps', 'development'); // 'cpps-dev'
 * ```
 */
export function resolveScheme(base: string, variant: AppVariant): string {
  switch (variant) {
    case 'development':
      return `${base}-dev`;
    case 'preview':
      return `${base}-preview`;
    case 'production':
      return base;
  }
}

/**
 * Builds the platform bundle identifier for a variant.
 *
 * Suffixing the base identifier is what allows development, preview, and
 * production builds of the *same* app to be installed side by side. Note this
 * only disambiguates variants of one app — two apps sharing a base identifier
 * still collide, which is why `AppSpec.baseBundleIdentifier` is per-app.
 *
 * @param base - Base identifier from the spec.
 * @param variant - Resolved build variant.
 * @returns The identifier suffixed with `.dev` or `.preview`, or the base
 *   identifier unchanged for `production`.
 *
 * @example
 * ```ts
 * resolveBundleIdentifier('com.jyrwajr.csspmobile', 'development');
 * // 'com.jyrwajr.csspmobile.dev'
 * ```
 */
export function resolveBundleIdentifier(base: string, variant: AppVariant): string {
  switch (variant) {
    case 'development':
      return `${base}.dev`;
    case 'preview':
      return `${base}.preview`;
    case 'production':
      return base;
  }
}

/**
 * Resolves the full identity for an app at a given variant.
 *
 * iOS and Android receive the same value: both platforms use the base
 * identifier identically, and keeping them derived from one function means
 * they cannot drift apart.
 *
 * Pure — performs no I/O and reads no environment, so the variant must be
 * resolved by the caller (see `resolveAppVariant`).
 *
 * @param spec - The app's build-time specification.
 * @param variant - Resolved build variant.
 * @returns Identity fields with every variant suffix already applied.
 *
 * @example
 * ```ts
 * const identity = resolveIdentity(spec, 'production');
 * identity.bundleIdentifier; // 'com.jyrwajr.csspmobile'
 * ```
 */
export function resolveIdentity(spec: AppSpec, variant: AppVariant): ResolvedIdentity {
  const bundleIdentifier = resolveBundleIdentifier(spec.baseBundleIdentifier, variant);

  return {
    name: resolveAppName(spec.appName, variant),
    slug: spec.slug,
    scheme: resolveScheme(spec.scheme, variant),
    version: spec.version,
    bundleIdentifier,
    androidPackage: bundleIdentifier,
  };
}
