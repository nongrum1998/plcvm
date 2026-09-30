/**
 * @file Build-variant resolution.
 *
 * Resolves which {@link AppVariant} a build is being produced for, from the
 * `APP_VARIANT` environment variable that EAS injects per build profile in
 * `eas.json`.
 *
 * The two failure modes this module exists to prevent:
 *
 * 1. A **typo** in `APP_VARIANT` silently falling through to a different
 *    variant. Invalid values throw instead.
 * 2. A **production** EAS build resolving to `development` because the
 *    production profile in `eas.json` forgot to set `APP_VARIANT`. That
 *    failure is silent — it produces a build with a `.dev` bundle identifier
 *    and, worse, `usesCleartextTraffic: true` (see `build-properties.ts`).
 *    A production-profile build with no variant is therefore rejected.
 */

import type { AppVariant } from './types';

/** Every accepted value of `APP_VARIANT`, in declaration order. */
const APP_VARIANTS: readonly AppVariant[] = ['development', 'preview', 'production'];

/** Environment variable naming the build variant. Set per profile in `eas.json`. */
const APP_VARIANT = 'APP_VARIANT';

/**
 * The subset of `process.env` this module reads.
 *
 * Exported so callers can pass an explicit environment instead of relying on
 * the ambient `process.env`, which keeps the resolution rules inspectable and
 * the module free of side effects at import time.
 */
export interface VariantEnv {
  /** Value of `APP_VARIANT`. Whitespace is trimmed before validation. */
  APP_VARIANT?: string;
  /** Value of `EAS_BUILD_PROFILE`, set by EAS on the build server. */
  EAS_BUILD_PROFILE?: string;

  /**
   * Open index signature so `process.env` (whose `ProcessEnv` type has only an
   * index signature, no declared properties) is assignable.
   *
   * Without this, TypeScript's weak-type check rejects `env: VariantEnv =
   * process.env`: every property of `VariantEnv` is optional, and `ProcessEnv`
   * shares no *declared* property with it.
   */
  [key: string]: string | undefined;
}

/**
 * Type guard narrowing an arbitrary string to an {@link AppVariant}.
 *
 * Exported for consumers that need to validate a variant without the
 * environment lookup and the accompanying throw semantics.
 *
 * @param value - Candidate variant name.
 * @returns True when `value` is exactly one of the three known variants.
 *
 * @example
 * ```ts
 * if (isAppVariant(raw)) console.log(`building ${raw}`);
 * ```
 */
export function isAppVariant(value: string): value is AppVariant {
  return APP_VARIANTS.includes(value as AppVariant);
}

/**
 * Resolves the build variant for the current environment.
 *
 * Resolution order:
 *
 * 1. `APP_VARIANT` set and valid → that variant.
 * 2. `APP_VARIANT` set but invalid → **throw**, so a typo cannot silently
 *    produce a differently-identified build.
 * 3. `APP_VARIANT` unset while `EAS_BUILD_PROFILE` is `production` → **throw**.
 *    A release build that never named its variant is the misconfiguration
 *    described in this file's header.
 * 4. `APP_VARIANT` unset in any other context, including local `expo start` →
 *    `development`. This preserves the historical default the workspace's
 *    local workflow depends on.
 *
 * @param env - Environment to read. Defaults to the ambient `process.env`.
 * @returns The resolved variant. Never returns for case 2 or 3.
 * @throws {Error} When `APP_VARIANT` holds a value that is not a known
 *   variant. The message lists the accepted values.
 * @throws {Error} When `APP_VARIANT` is unset on a production-profile EAS
 *   build. The message names the profile and states the `eas.json` fix.
 *
 * @example
 * ```ts
 * const variant = resolveAppVariant();             // reads process.env
 * const preview = resolveAppVariant({ APP_VARIANT: 'preview' });
 * ```
 */
export function resolveAppVariant(env: VariantEnv = process.env): AppVariant {
  const raw = env.APP_VARIANT?.trim();

  if (raw) {
    if (!isAppVariant(raw)) {
      throw new Error(
        `Invalid ${APP_VARIANT} "${raw}". Expected one of: ${APP_VARIANTS.join(', ')}. ` +
          `Set it per build profile in eas.json.`
      );
    }

    return raw;
  }

  if (env.EAS_BUILD_PROFILE === 'production') {
    throw new Error(
      `${APP_VARIANT} is unset on a "production" EAS build. ` +
        `Add "env": { "${APP_VARIANT}": "production" } to the production build ` +
        `profile in eas.json. Without it this build resolves to "development" ` +
        `and ships with a .dev bundle identifier and cleartext HTTP traffic enabled.`
    );
  }

  return 'development';
}
