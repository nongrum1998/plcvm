import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

import { TokenStoreManager } from '@stores/token.store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const getItemAsyncMock = jest.mocked(getItemAsync);
const setItemAsyncMock = jest.mocked(setItemAsync);
const deleteItemAsyncMock = jest.mocked(deleteItemAsync);

/**
 * `expo-secure-store` rejects keys outside `/^[\w.-]+/`, so these are
 * dot-namespaced. The literals are the contract between this store and the
 * device keychain — if they change, every signed-in user is logged out on
 * upgrade.
 */
const ACCESS_TOKEN_KEY = 'pension.auth.accessToken';
const REFRESH_TOKEN_KEY = 'pension.auth.refreshToken';

/** Reads the first key a mocked SecureStore call was made with. */
const firstKeyOf = (mock: { mock: { calls: unknown[][] } }): unknown => mock.mock.calls[0]?.[0];

describe('TokenStoreManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getItemAsyncMock.mockResolvedValue(null);
    setItemAsyncMock.mockResolvedValue(undefined);
    deleteItemAsyncMock.mockResolvedValue(undefined);
  });

  describe('access token', () => {
    it('reads the access token from the namespaced key', async () => {
      getItemAsyncMock.mockResolvedValue('access-token-value');

      await expect(TokenStoreManager.getAccessToken()).resolves.toBe('access-token-value');
      expect(firstKeyOf(getItemAsyncMock)).toBe(ACCESS_TOKEN_KEY);
    });

    it('resolves null when no access token is stored', async () => {
      getItemAsyncMock.mockResolvedValue(null);

      await expect(TokenStoreManager.getAccessToken()).resolves.toBeNull();
    });

    it('writes the access token to the namespaced key', async () => {
      await TokenStoreManager.addAccessToken('new-access-token');

      expect(firstKeyOf(setItemAsyncMock)).toBe(ACCESS_TOKEN_KEY);
      expect(setItemAsyncMock.mock.calls[0]?.[1]).toBe('new-access-token');
    });

    it('deletes the access token by the namespaced key', async () => {
      await TokenStoreManager.removeAccessToken();

      expect(firstKeyOf(deleteItemAsyncMock)).toBe(ACCESS_TOKEN_KEY);
    });
  });

  describe('refresh token', () => {
    it('reads the refresh token from the namespaced key', async () => {
      getItemAsyncMock.mockResolvedValue('refresh-token-value');

      await expect(TokenStoreManager.getRefreshToken()).resolves.toBe('refresh-token-value');
      expect(firstKeyOf(getItemAsyncMock)).toBe(REFRESH_TOKEN_KEY);
    });

    it('resolves null when no refresh token is stored', async () => {
      getItemAsyncMock.mockResolvedValue(null);

      await expect(TokenStoreManager.getRefreshToken()).resolves.toBeNull();
    });

    it('writes the refresh token to the namespaced key', async () => {
      await TokenStoreManager.addRefreshToken('new-refresh-token');

      expect(firstKeyOf(setItemAsyncMock)).toBe(REFRESH_TOKEN_KEY);
      expect(setItemAsyncMock.mock.calls[0]?.[1]).toBe('new-refresh-token');
    });

    it('deletes the refresh token by the namespaced key', async () => {
      await TokenStoreManager.removeRefreshToken();

      expect(firstKeyOf(deleteItemAsyncMock)).toBe(REFRESH_TOKEN_KEY);
    });
  });

  describe('removeTokens', () => {
    it('deletes both token keys', async () => {
      await TokenStoreManager.removeTokens();

      const deletedKeys = deleteItemAsyncMock.mock.calls.map((call) => call[0]);
      expect(deletedKeys).toEqual(expect.arrayContaining([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]));
      expect(deletedKeys).toHaveLength(2);
    });

    it('leaves unrelated keychain entries untouched', async () => {
      await TokenStoreManager.removeTokens();

      const deletedKeys = deleteItemAsyncMock.mock.calls.map((call) => call[0]);
      expect(deletedKeys).not.toContain('auth-storage');
      expect(deletedKeys).not.toContain('ACCESS_TOKEN_KEY');
    });

    it('resolves when neither token is present', async () => {
      await expect(TokenStoreManager.removeTokens()).resolves.toBeUndefined();
    });
  });

  describe('access token isolation', () => {
    it('never reads the refresh key when fetching the access token', async () => {
      await TokenStoreManager.getAccessToken();

      const readKeys = getItemAsyncMock.mock.calls.map((call) => call[0]);
      expect(readKeys).not.toContain(REFRESH_TOKEN_KEY);
    });
  });
});
