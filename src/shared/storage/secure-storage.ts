import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * Minimal async key/value contract, matching the shape zustand's
 * `StateStorage` expects but usable on its own for secrets that are not part
 * of a store.
 */
export interface SecureStorage {
  /** Reads a value, resolving `null` when the key is absent. */
  get: (key: string) => Promise<string | null>;
  /** Writes a value, replacing any existing entry. */
  set: (key: string, value: string) => Promise<void>;
  /** Deletes a entry. Resolves without error when the key is already absent. */
  remove: (key: string) => Promise<void>;
}

/**
 * Subset of `expo-secure-store` options that is safe to reuse across every
 * read, write and delete for a given storage instance.
 *
 * `keychainAccessible` is deliberately **not** defaulted here. Changing the
 * accessibility level after values have been written can make existing
 * entries unreadable, which would silently log users out on adoption. Callers
 * that want a hardened level must opt in explicitly and accept that existing
 * entries written under a different level are not readable through it.
 */
export interface SecureStorageOptions {
  /**
   * iOS only. Keychain service (the `kSecAttrService` equivalent) that scopes
   * entries. Required if entries were written with a `keychainService`.
   */
  keychainService?: string;
  /**
   * iOS only. Keychain accessibility class for entries written through this
   * instance. Consider `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` for credentials
   * that must not leave the device or survive a backup.
   */
  keychainAccessible?: SecureStore.KeychainAccessibilityConstant;
  /**
   * Requires device authentication before returning a value. Not supported in
   * Expo Go when biometric authentication is available. See
   * {@link https://docs.expo.dev/versions/latest/sdk/securestore | Expo docs}.
   */
  requireAuthentication?: boolean;
}

/**
 * Creates a `expo-secure-store` backed key/value store.
 *
 * Intended for secrets and small values only. SecureStore is a keychain /
 * Keystore entry, not a general database: entries above roughly 2 KB are
 * unsuitable on Android, and writing large state here is both slow and a
 * poor fit for the platform. Use it for tokens and credentials; do not use it
 * as the backing store for bulk or frequently rewritten state.
 *
 * Keys must be built with {@link createStorageKey} or otherwise satisfy the
 * native `/^[\w.-]+$/` rule.
 *
 * @param options SecureStore options applied to every operation.
 * @returns A {@link SecureStorage} bound to those options.
 * @throws {Error} Propagates SecureStore errors, including for invalid keys.
 *
 * @example
 * const storage = createSecureStorage({ keychainService: 'com.pension.auth' });
 * await storage.set(createStorageKey('auth', 'token'), 'abc123');
 * await storage.get(createStorageKey('auth', 'token')); // 'abc123'
 */
export const createSecureStorage = (options: SecureStorageOptions = {}): SecureStorage => ({
  get: (key) => SecureStore.getItemAsync(key, options),
  set: (key, value) => SecureStore.setItemAsync(key, value, options),
  remove: (key) => SecureStore.deleteItemAsync(key, options),
});

/**
 * Adapts a {@link SecureStorage} to zustand's `StateStorage` interface so it
 * can back `persist` middleware.
 *
 * This adapter deals only in strings. JSON encoding and decoding is handled by
 * zustand's `createJSONStorage`, which wraps a `StateStorage`; see
 * {@link createPersistedStore}.
 *
 * @param storage Backing store, typically from {@link createSecureStorage}.
 * @returns A `StateStorage` delegating to `storage`.
 *
 * @example
 * const storage = createJSONStorage(() =>
 *   createSecureStateStorage(createSecureStorage({ keychainService: 'app' }))
 * );
 */
export const createSecureStateStorage = (storage: SecureStorage): StateStorage => ({
  getItem: (name) => storage.get(name),
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.remove(name),
});
