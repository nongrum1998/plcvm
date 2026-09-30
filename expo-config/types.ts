/**
 * @file Build-time configuration contracts for the workspace apps.
 *
 * Defines the per-app specification an app hands to
 * {@link createAppConfig}, plus the shape the resolvers hand back. Types only
 * — this module carries no runtime logic, so it can be imported from any layer
 * without side effects.
 *
 * @packageDocumentation
 */

import type { ExpoConfig } from 'expo/config';

/**
 * Build variants an app can be produced for.
 *
 * The variant is chosen at build time by the `APP_VARIANT` environment
 * variable, which EAS sets per build profile in `eas.json`. It drives the
 * display name, the URL scheme, and the bundle identifier suffix so that
 * development, preview, and production builds can coexist on one device.
 *
 * - `development` — local `expo start` and the EAS `development` profile
 * - `preview` — internal distribution builds from the EAS `preview` profile
 * - `production` — store-bound builds from the EAS `production` profile
 */
export type AppVariant = 'development' | 'preview' | 'production';

/**
 * A single entry in an Expo `plugins` array.
 *
 * Derived from Expo's own declaration instead of being re-declared here, so
 * every entry this package produces stays assignable to
 * `ExpoConfig['plugins']` even if Expo widens or narrows the accepted shapes.
 */
export type ConfigPluginEntry = NonNullable<ExpoConfig['plugins']>[number];

/**
 * Per-app build-time identity, resolved for one {@link AppVariant}.
 *
 * Produced by {@link resolveIdentity}. Every field is already variant-adjusted
 * — the caller never re-derives a suffix.
 */
export interface ResolvedIdentity {
  /** Human-facing app name shown under the home-screen icon. */
  name: string;
  /** Expo project slug. Identifies the EAS project; never derived. */
  slug: string;
  /** Deep-link scheme, e.g. `cpps-dev`. */
  scheme: string;
  /** Marketing/CFBundleShortVersionString version. */
  version: string;
  /** iOS bundle identifier, variant-suffixed. */
  bundleIdentifier: string;
  /** Android application id, variant-suffixed. */
  androidPackage: string;
}

/**
 * Everything an app must declare to be built by this package.
 *
 * Every field is required and none has a default. That is deliberate: the two
 * workspace apps previously declared an identical bundle identifier, slug, and
 * EAS project, so their builds silently overwrote each other on a device and
 * shared an OTA channel. Making identity non-optional and per-app means a
 * consumer cannot omit a field and inherit another app's identity.
 */
export interface AppSpec {
  /**
   * Base display name without any variant suffix, e.g. `CPPS`. The variant
   * suffix is appended by {@link resolveIdentity}.
   */
  appName: string;

  /**
   * Expo project slug, e.g. `cssp`. Used verbatim as `slug` in the manifest.
   *
   * Never derived from the folder name: changing a slug re-links the EAS
   * project and the store listing, so it must never change as a side effect
   * of a refactor.
   */
  slug: string;

  /**
   * Base deep-link scheme without the variant suffix, e.g. `cpps`.
   *
   * Deliberately a **separate** field from {@link AppSpec.slug} rather than
   * derived from it. The two do not have to agree — `cpps` currently ships
   * `slug: 'cssp'` with `scheme: 'cpps'` — and collapsing them would silently
   * rewrite the app's deep links (`cpps://` -> `cssp://`) and break anything
   * that links into the app. Keeping them apart makes that divergence
   * visible in the spec instead of hiding it behind a derivation.
   */
  scheme: string;

  /**
   * Bundle identifier without the variant suffix, e.g.
   * `com.jyrwajr.csspmobile`. Must be unique per app and per variant.
   */
  baseBundleIdentifier: string;

  /** EAS project id (UUID). Also determines the OTA update URL. */
  projectId: string;

  /** Expo account that owns the project. */
  owner: string;

  /** App version. EAS uses `appVersionSource: "remote"`, so this is a local fallback. */
  version: string;

  /** App icon path, relative to the app root. Reused for the adaptive icon. */
  icon: string;

  /**
   * iOS `NSCameraUsageDescription` copy. Lives here rather than in the
   * package because it is user-facing app identity text, not build machinery.
   */
  cameraUsageDescription: string;

  /**
   * Extra config plugins owned by the app, inserted directly after
   * `expo-sharing` so the overall plugin order stays identical to a
   * hand-written config.
   *
   * The shared entries (`expo-router`, `expo-sharing`, `expo-splash-screen`,
   * `expo-build-properties`, `expo-secure-store`) are supplied by the factory
   * and must not be repeated here.
   */
  plugins?: readonly ConfigPluginEntry[];
}
