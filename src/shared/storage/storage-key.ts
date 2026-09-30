/**
 * Key construction for `expo-secure-store` backed storage.
 *
 * `expo-secure-store` validates every key against `/^[\w.-]+$/` and throws
 * `Invalid key provided to SecureStore` for anything else. Notably this rules
 * out colons, slashes and whitespace, so the conventional
 * `namespace:sub:key` shape is unusable. This module namespaces with `.` and
 * fails fast on segments that would throw at the native boundary, turning a
 * runtime crash deep inside a keychain call into an immediate, named error.
 */

/**
 * Key segments allowed by `expo-secure-store`. Mirrors the native
 * `/^[\w.-]+$/` check: word characters, `.` and `-` only.
 */
const SEGMENT_PATTERN = /^[\w.-]+$/;

/** Prefix applied to every generated key so workspace keys are identifiable. */
const NAMESPACE = 'pension';

/**
 * Builds a namespaced, native-valid storage key from ordered segments.
 *
 * Segments are joined with `.` and prefixed with `pension.`, so
 * `createStorageKey('auth', 'token')` produces `pension.auth.token`.
 *
 * @param segments Ordered key segments. Each must match `/^[\w.-]+$/`.
 * @returns The joined key, safe to pass to `expo-secure-store`.
 * @throws {TypeError} If no segments are supplied, if a segment is not a
 * string, or if a segment contains characters `expo-secure-store` rejects.
 *
 * @example
 * createStorageKey('auth', 'token'); // 'pension.auth.token'
 * createStorageKey('auth:token');  // throws TypeError
 */
export const createStorageKey = (...segments: string[]): string => {
  if (segments.length === 0) {
    throw new TypeError(
      `createStorageKey requires at least one segment, received none. Example: createStorageKey('auth', 'token')`
    );
  }

  for (const [index, segment] of segments.entries()) {
    if (typeof segment !== 'string') {
      throw new TypeError(
        `createStorageKey segment at index ${index} must be a string, received ${typeof segment}.`
      );
    }

    if (!SEGMENT_PATTERN.test(segment)) {
      throw new TypeError(
        `createStorageKey segment "${segment}" at index ${index} is invalid. ` +
          `expo-secure-store only permits word characters, ".", "-" and "_" — ` +
          `colons, slashes and spaces are rejected by the native layer.`
      );
    }
  }

  return [NAMESPACE, ...segments].join('.');
};
