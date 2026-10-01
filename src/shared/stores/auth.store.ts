import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { UserT } from '../types/auth';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '@utils';
import { http } from '@utils/http';
import { ENDPOINTS } from '@utils/constants';

/**
 * Namespaced keychain key holding the cached auth profile.
 *
 * `expo-secure-store` rejects keys outside `/^[\w.-]+/`, so the namespace is
 * dot-separated rather than the conventional `namespace:key`. This literal is
 * the contract with the device keychain — changing it invalidates every cached
 * profile on upgrade.
 */
const AUTH_STORAGE_KEY = 'pension.auth';

/** The slice of auth state mirrored to the keychain. */
type PersistedAuth = {
  user: UserT | null;
  isSignedIn: boolean;
};

/**
 * Narrows a parsed cache blob to {@link PersistedAuth}.
 *
 * Only checks that both keys are present. This is a cache, not a trust
 * boundary: a malformed value yields `null` so the caller falls back to a clean
 * signed-out session rather than trusting untyped data.
 */
const isPersistedAuth = (value: unknown): value is PersistedAuth =>
  typeof value === 'object' && value !== null && 'user' in value && 'isSignedIn' in value;

/**
 * Reads the cached auth profile from the keychain.
 *
 * @returns The cached profile, or `null` when nothing is cached, the blob is
 *   unparseable, or the keychain cannot be read.
 */
const readPersistedAuth = async (): Promise<PersistedAuth | null> => {
  try {
    const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isPersistedAuth(parsed) ? parsed : null;
  } catch (error) {
    logger.error('AuthStore: could not read the cached session', error);
    return null;
  }
};

/**
 * Writes the durable slice of auth state to the keychain.
 *
 * Swallows keychain failures: a cache that cannot be written must not fail the
 * sign-in that produced it. The session is anchored by the token in
 * `TokenStoreManager`, so a lost cache is repaired on the next launch.
 *
 * @param payload The profile and sign-in flag to cache.
 */
const writePersistedAuth = async (payload: PersistedAuth): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    logger.error('AuthStore: could not cache the session', error);
  }
};

type AuthStore = {
  user?: UserT | null;
  isSignedIn: boolean;
  isAuthLoading: boolean;

  fetchUser: () => Promise<void>;
  refresh: () => void;
  reset: () => Promise<void>;
  logout: () => Promise<void>;
  _hydrate: () => Promise<void>;
};

/**
 * Authenticated session state.
 *
 * A plain zustand store. The durable slice (`user`, `isSignedIn`) is mirrored to
 * the device keychain explicitly — at the two mutation points that change it,
 * rather than on every state change — under the namespaced key `pension.auth`.
 * `isAuthLoading` is deliberately never cached: restoring a `true` would strand
 * the app behind a spinner with no request in flight.
 *
 * The stored token, not the cached profile, is what keeps a user signed in.
 * `_hydrate` reads the profile for a fast first paint, then refreshes it from
 * the API whenever a token is present.
 */
export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isSignedIn: false,
  isAuthLoading: true,

  fetchUser: async (keepStaleOnError?: boolean) => {
    set({ isAuthLoading: true });
    const accessToken = await TokenStoreManager.getAccessToken();
    if (accessToken) {
      try {
        const { data, success } = await http.post<UserT>(ENDPOINTS.AUTH.USER, {});
        if (data && success) {
          set({
            user: data,
            isSignedIn: true,
            isAuthLoading: false,
          });
          await writePersistedAuth({ user: data, isSignedIn: true });
        } else {
          await get().reset();
        }
      } catch {
        if (!keepStaleOnError) {
          await get().reset();
        }
      } finally {
        set({ isAuthLoading: false });
      }
    }
  },
  refresh: () => void get().fetchUser(),
  reset: async () => {
    set({ user: null, isSignedIn: false });
    await writePersistedAuth({ user: null, isSignedIn: false });
  },
  logout: async () => {
    try {
      set({ isAuthLoading: true });
      const accessToken = await TokenStoreManager.getAccessToken();

      if (accessToken) {
        await http.post(ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      logger.error('AuthStore: logout API call failed', error);
    }

    await TokenStoreManager.removeTokens();
    await get().reset();

    try {
      const { queryClient } = await import('@utils/react-query');
      queryClient.clear();
    } catch (error) {
      logger.error('Error Logout Query Clear', error);
    }
    set({ isAuthLoading: false });
  },

  _hydrate: async () => {
    try {
      const cached = await readPersistedAuth();
      if (cached) {
        set({ user: cached.user, isSignedIn: cached.isSignedIn });
      }

      const accessToken = await TokenStoreManager.getAccessToken();
      if (accessToken) {
        await get().fetchUser();
      } else {
        await get().reset();
      }
    } catch {
      await get().reset();
    } finally {
      set({ isAuthLoading: false });
    }
  },
}));
