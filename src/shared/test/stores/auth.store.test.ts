import { waitFor } from '@testing-library/react-native';

import { http } from '@utils/http';
import type { UserT } from '@sharedTypes/auth/auth';

/**
 * In-memory stand-in for the device keychain. Declared at module scope so the
 * mock factory can close over it, and shared across `jest.isolateModules`
 * reloads of the store under test.
 */
const mockBacking = new Map<string, string>();

/**
 * Keys passed to `getItemAsync`, in order. Tracked here rather than asserted on
 * the jest mocks because `jest.isolateModules` rebuilds the mocked
 * `expo-secure-store` module — and its `jest.fn()`s — on every reload, while
 * this array lives in the test file's own module scope and stays stable.
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
jest.mock('@utils/http', () => ({ http: { post: jest.fn() } }));
jest.mock('@utils/react-query', () => ({ queryClient: { clear: jest.fn() } }));
jest.mock('@utils', () => ({
  logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

/** The namespaced persist key `@storage` writes the auth session to. */
const AUTH_STORAGE_KEY = 'pension.auth';
/** The pre-migration key. Nothing should read or write this any more. */
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

/**
 * Builds a fresh auth store so `persist` hydration re-runs against the current
 * `mockBacking`.
 *
 * `jest.isolateModules` hands the callback a new module registry, which is why
 * the store has to be pulled in with a lazy `require` rather than a hoisted
 * import: a top-level import would resolve once, against the original registry,
 * and hydration would never run per test.
 */
const loadAuthStore = () => {
  let store!: typeof import('@stores/auth.store').useAuthStore;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- see above
    store = require('@stores/auth.store').useAuthStore;
  });
  return store;
};

const seedToken = (token = 'access-token') => {
  mockBacking.set('pension.auth.accessToken', token);
};

describe('useAuthStore persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBacking.clear();
    mockReads.length = 0;
    httpPostMock.mockReset();
  });

  it('writes the session to the namespaced key', async () => {
    const store = loadAuthStore();

    store.setState({ user, isSignedIn: true });

    await waitFor(() => expect(mockBacking.has(AUTH_STORAGE_KEY)).toBe(true));
  });

  it('never writes to the legacy unprefixed key', async () => {
    const store = loadAuthStore();

    store.setState({ user, isSignedIn: true });

    await waitFor(() => expect(mockBacking.has(AUTH_STORAGE_KEY)).toBe(true));
    expect(mockBacking.has(LEGACY_AUTH_STORAGE_KEY)).toBe(false);
  });

  it('persists only the durable subset, with loading forced to false', async () => {
    const store = loadAuthStore();

    store.setState({ user, isSignedIn: true, isAuthLoading: true });

    await waitFor(() => expect(mockBacking.has(AUTH_STORAGE_KEY)).toBe(true));

    const persisted = JSON.parse(mockBacking.get(AUTH_STORAGE_KEY) as string).state;
    expect(Object.keys(persisted).sort()).toEqual(['isAuthLoading', 'isSignedIn', 'user']);
    expect(persisted.isAuthLoading).toBe(false);
    expect(persisted.user).toEqual(user);
  });

  it('hydrates a previously persisted user from the namespaced key', async () => {
    mockBacking.set(
      AUTH_STORAGE_KEY,
      JSON.stringify({ state: { user, isSignedIn: true, isAuthLoading: false }, version: 1 })
    );

    const store = loadAuthStore();

    await waitFor(() => expect(store.getState().user).toEqual(user));
    expect(store.getState().isSignedIn).toBe(true);
    expect(mockReads).toContain(AUTH_STORAGE_KEY);
  });

  it('ignores a session left behind under the legacy key', async () => {
    mockBacking.set(
      LEGACY_AUTH_STORAGE_KEY,
      JSON.stringify({ state: { user, isSignedIn: true, isAuthLoading: false }, version: 1 })
    );

    const store = loadAuthStore();

    // Wait for hydration to read the namespaced key, then prove it never
    // consulted the legacy one and therefore left the session empty.
    await waitFor(() => expect(mockReads).toContain(AUTH_STORAGE_KEY));
    expect(mockReads).not.toContain(LEGACY_AUTH_STORAGE_KEY);
    expect(store.getState().user).toBeNull();
  });
});

describe('useAuthStore behaviour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBacking.clear();
    mockReads.length = 0;
    httpPostMock.mockReset();
  });

  it('reset clears the session', () => {
    const store = loadAuthStore();

    store.setState({ user, isSignedIn: true });
    store.getState().reset();

    expect(store.getState().user).toBeNull();
    expect(store.getState().isSignedIn).toBe(false);
  });

  it('fetchUser stores the user returned by the API', async () => {
    seedToken();
    httpPostMock.mockResolvedValue({ data: user, success: true } as never);
    const store = loadAuthStore();

    await store.getState().fetchUser();

    expect(store.getState().user).toEqual(user);
    expect(store.getState().isSignedIn).toBe(true);
    expect(store.getState().isAuthLoading).toBe(false);
  });

  it('fetchUser resets the session when the API reports failure', async () => {
    seedToken();
    httpPostMock.mockResolvedValue({ data: null, success: false } as never);
    const store = loadAuthStore();
    store.setState({ user, isSignedIn: true });

    await store.getState().fetchUser();

    expect(store.getState().user).toBeNull();
    expect(store.getState().isSignedIn).toBe(false);
  });

  it('fetchUser leaves the session alone when no token is stored', async () => {
    const store = loadAuthStore();

    await store.getState().fetchUser();

    expect(httpPostMock).not.toHaveBeenCalled();
  });

  it('logout removes both token keys and clears the session', async () => {
    seedToken();
    mockBacking.set('pension.auth.refreshToken', 'refresh-token');
    const store = loadAuthStore();
    store.setState({ user, isSignedIn: true });

    await store.getState().logout();

    expect(mockBacking.has('pension.auth.accessToken')).toBe(false);
    expect(mockBacking.has('pension.auth.refreshToken')).toBe(false);
    expect(store.getState().user).toBeNull();
    expect(store.getState().isSignedIn).toBe(false);
  });
});
