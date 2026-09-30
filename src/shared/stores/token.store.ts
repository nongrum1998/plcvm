import { createSecureStorage, createStorageKey } from '@storage';

/**
 * SecureStore-backed key/value store, created once and shared by every token
 * operation so the SecureStore options stay consistent across the module.
 *
 * `expo-secure-store` rejects keys outside `/^[\w.-]+$/`; `createStorageKey`
 * namespaces them under `pension.` and fails fast on segments the native layer
 * would refuse, so an invalid key surfaces here rather than at a keychain call.
 */
const storage = createSecureStorage();

/** Namespaced keychain key holding the main access token. */
const accessTokenKey = createStorageKey('auth', 'accessToken');

/** Namespaced keychain key holding the refresh token. */
const refreshTokenKey = createStorageKey('auth', 'refreshToken');

/**
 * Manages persistence of authentication tokens in the device secure store.
 *
 * Wraps `@storage`'s `createSecureStorage` to read, write and delete
 * the access and refresh tokens. Values are stored encrypted at rest in the
 * platform keychain/keystore under the namespaced keys `pension.auth.accessToken`
 * and `pension.auth.refreshToken`. All operations are async and may reject if
 * the secure store is unavailable or a value cannot be decrypted.
 *
 * The public method signatures are depended on by the axios client in
 * `@utils/http`, so they must not change.
 */
export const TokenStoreManager = {
  /**
   * Reads the main access token from the secure store.
   *
   * @returns A promise resolving to the stored access token string, or null
   *   when no token has been saved.
   * @throws {Error} If the secure store cannot be read (e.g. keychain
   *   unavailability or decryption failure).
   */
  async getAccessToken(): Promise<string | null> {
    return await storage.get(accessTokenKey);
  },

  /**
   * Stores the main access token in the secure store, replacing any existing
   * value under the same key.
   *
   * @param token - The access token string to persist.
   * @returns A promise that resolves once the token has been written.
   * @throws {Error} If the secure store cannot be written.
   */
  async addAccessToken(token: string): Promise<void> {
    return await storage.set(accessTokenKey, token);
  },

  /**
   * Removes the main access token from the secure store.
   *
   * @returns A promise that resolves once the token has been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeAccessToken(): Promise<void> {
    return await storage.remove(accessTokenKey);
  },

  /**
   * Reads the refresh token from the secure store.
   *
   * @returns A promise resolving to the stored refresh token string, or null
   *   when no token has been saved.
   * @throws {Error} If the secure store cannot be read.
   */
  async getRefreshToken(): Promise<string | null> {
    return await storage.get(refreshTokenKey);
  },

  /**
   * Stores the refresh token in the secure store, replacing any existing
   * value under the same key.
   *
   * @param token - The refresh token string to persist.
   * @returns A promise that resolves once the token has been written.
   * @throws {Error} If the secure store cannot be written.
   */
  async addRefreshToken(token: string): Promise<void> {
    return await storage.set(refreshTokenKey, token);
  },

  /**
   * Removes the refresh token from the secure store.
   *
   * @returns A promise that resolves once the token has been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeRefreshToken(): Promise<void> {
    return await storage.remove(refreshTokenKey);
  },

  /**
   * Removes both the access and refresh tokens, ending the stored session.
   *
   * Deletes the access token first, then the refresh token. Deleting a key that
   * was never written resolves successfully, so this is safe to call on a
   * device with no stored session.
   *
   * @returns A promise that resolves once both tokens have been deleted.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeTokens(): Promise<void> {
    await storage.remove(accessTokenKey);
    await storage.remove(refreshTokenKey);
  },
};
