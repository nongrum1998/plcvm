import * as SecureStore from 'expo-secure-store';

/**
 * Namespaced keychain keys holding the session tokens.
 *
 * `expo-secure-store` rejects keys outside `/^[\w.-]+/`, so the namespace is
 * dot-separated rather than the conventional `namespace:key`. These literals
 * are the contract with the device keychain: changing either one logs out every
 * signed-in user on upgrade.
 */
const ACCESS_TOKEN_KEY = 'pension.auth.accessToken';
const REFRESH_TOKEN_KEY = 'pension.auth.refreshToken';

/**
 * Manages persistence of authentication tokens in the device secure store.
 *
 * Reads, writes and deletes the access and refresh tokens, stored encrypted at
 * rest in the platform keychain/keystore. All operations are async and may
 * reject if the secure store is unavailable or a value cannot be decrypted.
 *
 * These are the app's only secrets: everything else the store caches is either
 * non-sensitive or re-derivable from the API.
 *
 * The public method signatures are depended on by the axios client in
 * `@utils/http/client`, so they must not change.
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
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
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
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Removes the main access token from the secure store.
   *
   * @returns A promise that resolves once the token has been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeAccessToken(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },

  /**
   * Reads the refresh token from the secure store.
   *
   * @returns A promise resolving to the stored refresh token string, or null
   *   when no token has been saved.
   * @throws {Error} If the secure store cannot be read.
   */
  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
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
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Removes the refresh token from the secure store.
   *
   * @returns A promise that resolves once the token has been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
