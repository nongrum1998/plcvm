import { waitFor } from '@testing-library/react-native';

import { http } from '@utils/http/client';
import { useAuthStore } from '@stores/auth.store';
import type { UserT } from '@sharedTypes/auth/auth';

/**
 * In-memory stand-in for the device keychain, shared by the whole suite so the
 * store's real `expo-secure-store` calls observe it.
 */
const mockBacking = new Map<string, string>();

/**
 * Keys passed to `getItemAsync`, in order. Tracked here rather than asserted on
 * the jest mocks so a single array in the test file's module scope stays stable
 * regardless of module-load ordering.
 */
const mockReads: string[] = [];

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => {
    mockReads.push(key);
    return mockBacking.get(key) ?? null;
  }),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockBacking.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockBacking.delete(key);
  }),
}));
jest.mock('@utils/http/client', () => ({ http: { post: jest.fn() } }));
jest.mock('@utils/react-query/query-client', () => ({ queryClient: { clear: jest.fn() } }));
jest.mock('@utils/logger/logger', () => ({
  logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

/** The namespaced key `useAuthStore` caches the profile under. */
const AUTH_STORAGE_KEY = 'pension.auth';
/** The pre-refactor key. Nothing should read or write this any more. */
const LEGACY_AUTH_STORAGE_KEY = 'auth-storage';

const httpPostMock = jest.mocked(http.post);

const user: UserT = {
  app_date: '2024-01-15',
  app_exp: '2025-01-15',
  bank_accno: '0123456789',
  dob: '1980-01-01',
  gender: 'M',
  member_id: 'MEM-1',
  mtype: 'P',
  pclass: 'E',
  pclass_cd: 'E1',
  photo: null,
  pname: 'Test Pensioner',
  ppo_id: 'PPO-1',
  ppo_no: 'PPO-1',
  ptype_cd: 'S',
  rela: 'SELF',
  trea_code: 'TR-1',
  treasury_name: 'Treasury',
  pan_dob: '1980-01-01',
  pan_no: 'ABCDE1234F',
  height: '170',
  mobile_no: '9876543210',
  comty_cd: 'GEN',
  marital_cd: 'M',
  email: 'test.pensioner@example.com',
};

/** Seeds the access token so `fetchUser` will hit the API. */
const seedToken = (token = 'access-token') => {
  mockBacking.set('pension.auth.accessToken', token);
};

/** Seeds a previously cached profile, as written by an earlier launch. */
const seedCachedAuth = (payload: unknown) => {
  mockBacking.set(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

/**
 * Clears in-memory state and the keychain so each test starts signed out.
 * `reset` mirrors the cleared session back to the keychain, so the backing map
 * is emptied again afterwards.
 */
const resetToSignedOut = async () => {
  await useAuthStore.getState().reset();
  mockBacking.clear();
  mockReads.length = 0;
  useAuthStore.setState({ isAuthLoading: true });
};

beforeEach(async () => {
  jest.clearAllMocks();
  mockBacking.clear();
  mockReads.length = 0;
  httpPostMock.mockReset();
  httpPostMock.mockResolvedValue({ data: user, success: true } as never);
  await resetToSignedOut();
});

describe('useAuthStore keychain caching', () => {
  it('caches the profile under the namespaced key after a successful fetch', async () => {
    seedToken();

    await useAuthStore.getState().fetchUser();

    await waitFor(() => expect(mockBacking.has(AUTH_STORAGE_KEY)).toBe(true));
    expect(JSON.parse(mockBacking.get(AUTH_STORAGE_KEY) as string)).toEqual({
      user,
      isSignedIn: true,
    });
  });

  it('never writes to the legacy unprefixed key', async () => {
    seedToken();

    await useAuthStore.getState().fetchUser();

    await waitFor(() => expect(mockBacking.has(AUTH_STORAGE_KEY)).toBe(true));
    expect(mockBacking.has(LEGACY_AUTH_STORAGE_KEY)).toBe(false);
  });

  it('persists only the durable subset, never the loading flag', async () => {
    seedToken();
    useAuthStore.setState({ isAuthLoading: true });

    await useAuthStore.getState().fetchUser();

    await waitFor(() => expect(mockBacking.has(AUTH_STORAGE_KEY)).toBe(true));
    const cached = JSON.parse(mockBacking.get(AUTH_STORAGE_KEY) as string);
    expect(Object.keys(cached).sort()).toEqual(['isSignedIn', 'user']);
    expect(cached).not.toHaveProperty('isAuthLoading');
  });

  it('reads the cached profile from the namespaced key on hydration', async () => {
    seedToken();
    seedCachedAuth({ user, isSignedIn: true });

    await useAuthStore.getState()._hydrate();

    expect(mockReads).toContain(AUTH_STORAGE_KEY);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isSignedIn).toBe(true);
  });

  it('treats the stored token, not the cached profile, as the session anchor', async () => {
    // A cached profile with no token must still end signed out — this is what
    // makes the on-disk format safe to change, since the cache is repairable
    // from the API while the token is the only thing that keeps a user in.
    seedCachedAuth({ user, isSignedIn: true });

    await useAuthStore.getState()._hydrate();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isSignedIn).toBe(false);
  });

  it('ignores a session left behind under the legacy key', async () => {
    mockBacking.set(LEGACY_AUTH_STORAGE_KEY, JSON.stringify({ user, isSignedIn: true }));

    await useAuthStore.getState()._hydrate();

    expect(mockReads).not.toContain(LEGACY_AUTH_STORAGE_KEY);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isSignedIn).toBe(false);
  });

  it('falls back to a signed-out session when the cache is unparseable', async () => {
    mockBacking.set(AUTH_STORAGE_KEY, 'not-json{{');

    await expect(useAuthStore.getState()._hydrate()).resolves.toBeUndefined();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isSignedIn).toBe(false);
    expect(useAuthStore.getState().isAuthLoading).toBe(false);
  });

  it('clears the cached profile on reset', async () => {
    seedToken();
    await useAuthStore.getState().fetchUser();
    await waitFor(() => expect(mockBacking.has(AUTH_STORAGE_KEY)).toBe(true));

    await useAuthStore.getState().reset();

    expect(JSON.parse(mockBacking.get(AUTH_STORAGE_KEY) as string)).toEqual({
      user: null,
      isSignedIn: false,
    });
  });
});

describe('useAuthStore behaviour', () => {
  it('reset clears the session', async () => {
    useAuthStore.setState({ user, isSignedIn: true });

    await useAuthStore.getState().reset();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isSignedIn).toBe(false);
  });

  it('fetchUser stores the user returned by the API', async () => {
    seedToken();
    httpPostMock.mockResolvedValue({ data: user, success: true } as never);

    await useAuthStore.getState().fetchUser();

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isSignedIn).toBe(true);
    expect(useAuthStore.getState().isAuthLoading).toBe(false);
  });

  it('fetchUser resets the session when the API reports failure', async () => {
    seedToken();
    httpPostMock.mockResolvedValue({ data: null, success: false } as never);
    useAuthStore.setState({ user, isSignedIn: true });

    await useAuthStore.getState().fetchUser();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isSignedIn).toBe(false);
  });

  it('fetchUser leaves the session alone when no token is stored', async () => {
    await useAuthStore.getState().fetchUser();

    expect(httpPostMock).not.toHaveBeenCalled();
  });

  it('logout removes both token keys and clears the session', async () => {
    seedToken();
    mockBacking.set('pension.auth.refreshToken', 'refresh-token');
    useAuthStore.setState({ user, isSignedIn: true });

    await useAuthStore.getState().logout();

    expect(mockBacking.has('pension.auth.accessToken')).toBe(false);
    expect(mockBacking.has('pension.auth.refreshToken')).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isSignedIn).toBe(false);
  });
});
