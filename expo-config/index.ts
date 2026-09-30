/**
 * ./expo-config — shared build-time Expo configuration.
 *
 * Single source of truth for the `app.config.ts` of every workspace app. An
 * app supplies an {@link AppSpec}; {@link createAppConfig} resolves the build
 * variant from the environment and returns a complete `ExpoConfig`.
 *
 * Evaluated in plain Node by Expo's config loader, so this package has no
 * React Native or Expo runtime dependencies — `expo` appears only as a
 * type-only import. All exports are synchronous, because Expo rejects a
 * config file that returns a Promise.
 *
 * ```ts
 * import 'tsx/cjs';
 * import type { ExpoConfig } from 'expo/config';
 * import { createAppConfig } from './expo-config';
 * import { spec } from './app.spec';
 *
 * export default (): ExpoConfig => createAppConfig(spec);
 * ```
 *
 * @see resolveAppVariant — build-variant resolution and its failure modes
 * @see buildPropertiesPlugin — the security-critical Android/iOS build settings
 */

export * from './types';
export * from './variant';
export * from './identity';
export * from './build-properties';
export * from './create-app-config';
