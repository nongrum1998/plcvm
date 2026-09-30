/**
 * @file The single workspace copy of the `expo-build-properties` plugin config.
 *
 * This block was previously duplicated verbatim across both apps. Owning it
 * here means there is exactly one place the Android/iOS build settings — and
 * most importantly `usesCleartextTraffic` — can be wrong.
 *
 * ## `usesCleartextTraffic` is security-critical
 *
 * `false` forbids plain `http://` on **all** Android versions, allowing only
 * `https://`. This protects the pensioner's photograph and PII in transit.
 * Android 9 / API 28+ already blocks cleartext by default; setting it to
 * `false` also enforces it on 7.x / 8.x devices, so the policy is fail-secure
 * rather than dependent on the OS version.
 *
 * It is derived from the **resolved** variant, never from a raw environment
 * read, so it cannot silently disagree with the bundle identifier, display
 * name, or scheme. A production build resolves to `production` and therefore
 * always gets `false`.
 *
 * Note that a build whose `APP_VARIANT` never resolved to `production` is a
 * *different* failure — see `variant.ts`, which rejects a production-profile
 * build with no variant rather than letting it fall back to `development`.
 */

import type { AppVariant, ConfigPluginEntry } from './types';

/**
 * Builds the `expo-build-properties` plugin entry for a variant.
 *
 * Pure — performs no I/O and reads no environment. The caller passes the
 * already-resolved variant so this function cannot disagree with the identity
 * fields.
 *
 * @param variant - Resolved build variant. Only `production` differs.
 * @returns A `[pluginName, options]` tuple ready to drop into `plugins`.
 *
 * @example
 * ```ts
 * const entry = buildPropertiesPlugin('production');
 * // ['expo-build-properties', { android: { usesCleartextTraffic: false, ... } }]
 * ```
 */
export function buildPropertiesPlugin(variant: AppVariant): ConfigPluginEntry {
  return [
    'expo-build-properties',
    {
      // ── ANDROID CONFIG ────────────────────────────────────────────────
      android: {
        // compileSdkVersion = Android SDK 36 = Android 16 (Baklava, 2025)
        // compileSdkVersion is the SDK the app is COMPILED against; it lets
        // the code use the newest Android APIs at build time. Being "newer"
        // does NOT block old devices: Android supports apps built with newer
        // SDKs running on older OS versions (down to minSdkVersion).
        compileSdkVersion: 36,

        // targetSdkVersion = Android SDK 36 = Android 16
        // targetSdkVersion is the Android version whose runtime behavior the
        // app is OPTIMIZED and TESTED for. Google Play now REQUIRES target
        // SDK 35+ (Aug 2025) and 36 (Aug 2026) — 36 keeps the app publishable.
        // Note: target does NOT limit installs — devices on ANY newer Android
        // can still install the app.
        targetSdkVersion: 36,

        // buildToolsVersion = Android SDK Build-Tools 36.0.0 (ships with SDK 36)
        // The AAPT2 / dexer / zipalign toolchain used to actually BUILD the APK.
        // Keep in sync with compileSdkVersion (36 -> 36.0.0). Output still
        // installs on Android 7.0+ because minSdkVersion governs installs.
        buildToolsVersion: '36.0.0',

        // buildArchs = CPU architectures packaged into the APK/AAB
        //   arm64-v8a    -> 64-bit ARM — ALL modern phones (Android 5.0+)
        //   armeabi-v7a  -> 32-bit ARM — older / low-end phones (Android 4.0+)
        // arm64-v8a is REQUIRED (Play Store mandates 64-bit), armeabi-v7a is
        // kept so older 32-bit devices can still run the app.
        buildArchs: ['arm64-v8a'],

        // minSdkVersion = 24 = Android 7.0 (Nougat, 2016)
        // The LOWEST Android version the app supports — devices below it
        // cannot install it. "android - 7.0 >" is the supported range.
        // 24 is a safe floor: ~98%+ of active Android devices are 7.0+.
        minSdkVersion: 24,

        // enableMinifyInReleaseBuilds -> runs R8 code shrinker in release
        // builds only. Removes unused code + shortens identifiers, so the
        // APK is smaller and loads faster. No effect on debug builds.
        enableMinifyInReleaseBuilds: true,

        // enableShrinkResourcesInReleaseBuilds -> removes unused resources
        // (drawables, layouts, strings) in release builds, shrinking the APK
        // further. Must be used together with minify/R8 for correct analysis.
        enableShrinkResourcesInReleaseBuilds: true,

        // usesCleartextTraffic: false -> FORBID plain http:// on ALL Android
        // versions; only https:// is allowed. Protects the pensioner photo
        // and PII in transit. (Android 9/API 28+ blocks cleartext by default;
        // this also enforces it on 7.x/8.x devices -> fail-secure.)
        //
        // SECURITY: derived from the resolved variant, never from a raw
        // process.env read, so it cannot drift out of agreement with the
        // bundle identifier, scheme, or display name.
        usesCleartextTraffic: variant !== 'production',
      },

      // ── iOS CONFIG ────────────────────────────────────────────────────
      ios: {
        // deploymentTarget = iOS 16.4 (released March 2023)
        // The LOWEST iOS version the app supports — devices on older iOS
        // cannot install from the App Store. "ios - 16.4 >" is the range.
        // Installable iPhones: 8, 8 Plus, X (2017) and newer — including
        // Xs/Xr/11/SE2/12/13/SE3/14/15/16 series. Lower target = more old
        // devices supported; higher target = fewer iOS version checks needed.
        deploymentTarget: '16.4',
      },
    },
  ];
}
