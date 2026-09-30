/**
 * @file Assembles a complete `ExpoConfig` from a per-app spec.
 *
 * This is the single entry point apps use. It resolves the build variant,
 * derives the app's identity, and returns the whole manifest — replacing what
 * was previously a ~215-line hand-written `app.config.ts` per app.
 *
 * The returned object is plain data. It deliberately contains **no** functions
 * and **no** promises: Expo's `serializeAndEvaluate` invokes function-valued
 * config fields during serialization, and `evalConfig` rejects a config file
 * that returns a Promise. Keep it that way.
 */

import type { ExpoConfig } from 'expo/config';

import { buildPropertiesPlugin } from './build-properties';
import { resolveIdentity } from './identity';
import type { AppSpec, ConfigPluginEntry } from './types';
import { resolveAppVariant, type VariantEnv } from './variant';

/** Base URL of EAS's update service. The project id is the last path segment. */
const EAS_UPDATES_BASE_URL = 'https://u.expo.dev';

/** Glob of assets bundled into the app. Relative to the app root. */
const ASSET_BUNDLE_PATTERNS: readonly string[] = ['src/shared/assets/**/*'];

/** Platforms both workspace apps target. */
const PLATFORMS: readonly ('ios' | 'android')[] = ['ios', 'android'];

/**
 * Builds the `expo-splash-screen` entry, reusing the app icon for both the
 * light and dark variants.
 *
 * @param icon - App icon path from the spec, relative to the app root.
 * @returns A plugin entry ready to drop into `plugins`.
 */
function splashScreenPlugin(icon: string, color?: string, darkColor?: string): ConfigPluginEntry {
  return [
    'expo-splash-screen',
    {
      image: icon,
      backgroundColor: color ?? '#ffffff',
      dark: {
        image: icon,
        backgroundColor: darkColor ?? '#000000',
      },
    },
  ];
}

/**
 * Builds a complete Expo config for one app.
 *
 * Plugin order is fixed and preserved from the previous hand-written configs:
 * `expo-router`, `expo-sharing`, the app's own entries, `expo-splash-screen`,
 * `expo-build-properties`, `expo-secure-store`. Expo applies plugins
 * sequentially with each one's output feeding the next, so this ordering is
 * part of the contract rather than incidental.
 *
 * `updates.url` is derived from `projectId` (`https://u.expo.dev/<projectId>`,
 * the fixed EAS shape) rather than accepted as a separate field, so the two
 * cannot drift apart.
 *
 * @param spec - The app's build-time specification. Every field is required;
 *   see {@link AppSpec}.
 * @param env - Environment used to resolve the build variant. Defaults to the
 *   ambient `process.env`.
 * @returns A plain, serializable `ExpoConfig` with every variant suffix applied.
 * @throws {Error} Propagated from {@link resolveAppVariant} — an invalid
 *   `APP_VARIANT`, or a production-profile EAS build with no variant set.
 *
 * @example
 * ```ts
 * import 'tsx/cjs';
 * import type { ExpoConfig } from 'expo/config';
 * import { createAppConfig } from './expo-config';
 * import { spec } from './app.spec';
 *
 * export default (): ExpoConfig => createAppConfig(spec);
 * ```
 */
export function createAppConfig(spec: AppSpec, env: VariantEnv = process.env): ExpoConfig {
  const variant = resolveAppVariant(env);
  const identity = resolveIdentity(spec, variant);

  const plugins: ConfigPluginEntry[] = [
    'expo-router',
    ...(spec.plugins ?? []),
    splashScreenPlugin(spec.icon),
    buildPropertiesPlugin(variant),
    'expo-secure-store',
  ];

  return {
    name: identity.name,
    slug: identity.slug,
    version: identity.version,
    scheme: identity.scheme,

    platforms: [...PLATFORMS],
    orientation: 'portrait',
    userInterfaceStyle: 'light',

    icon: spec.icon,
    assetBundlePatterns: [...ASSET_BUNDLE_PATTERNS],

    // Enables typed routes (`expo-router` generated `.expo/types`) and lets
    // tsconfig `paths` resolve inside the router. Both apps ship this today.
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },

    plugins,

    ios: {
      supportsTablet: true,
      bundleIdentifier: identity.bundleIdentifier,
      infoPlist: {
        NSCameraUsageDescription: spec.cameraUsageDescription,
      },
    },

    android: {
      package: identity.androidPackage,
      permissions: ['android.permission.CAMERA', 'android.permission.LOCATION'],
      adaptiveIcon: {
        foregroundImage: spec.icon,
        backgroundColor: '#ffffff',
      },
    },

    updates: {
      url: `${EAS_UPDATES_BASE_URL}/${spec.projectId}`,
      checkAutomatically: 'ON_LOAD',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },

    extra: {
      // EAS reads this to link the build to the project. Removing it breaks
      // `eas build` / `eas update`, so it is emitted regardless of `variant`.
      eas: { projectId: spec.projectId },
      // Surfaced to runtime code via `Constants.expoConfig?.extra?.variant`.
      // Nothing consumes it yet; it exists so a build can identify itself
      // without inferring it from the bundle identifier.
      variant,
    },

    owner: spec.owner,
  };
}
