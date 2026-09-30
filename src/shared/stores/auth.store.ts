import { createPersistedStore } from '@storage';
import { UserT } from '../types/auth';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '@utils';
import { http } from '@utils/http';
import { ENDPOINTS } from '@utils/constants';

type AuthStore = {
  user?: UserT | null;
  isSignedIn: boolean;
  isAuthLoading: boolean;

  fetchUser: () => Promise<void>;
  refresh: () => void;
  reset: () => void;
  logout: () => Promise<void>;
  _hydrate: () => Promise<void>;
};

/**
 * Authenticated session state, persisted to the device keychain through
 * `@storage`.
 *
 * The persisted slice is only the durable subset (see `partialize`); actions
 * and the transient `isAuthLoading` flag are never written. State lands under
 * the namespaced key `pension.auth`.
 */
export const useAuthStore = createPersistedStore<AuthStore>(
  (set, get) => ({
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
          } else {
            get().reset();
          }
        } catch {
          if (!keepStaleOnError) {
            get().reset();
          }
        } finally {
          set({ isAuthLoading: false });
        }
      }
    },
    refresh: () => get().fetchUser(),
    reset: () => set({ user: null, isSignedIn: false }),
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
      get().reset();

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
        const accessToken = await TokenStoreManager.getAccessToken();
        if (accessToken) {
          await get().fetchUser();
        } else {
          get().reset();
        }
      } catch {
        get().reset();
      } finally {
        set({ isAuthLoading: false });
      }
    },
  }),
  {
    name: 'auth',
    version: 1,
    partialize: (state) => ({
      user: state.user,
      isSignedIn: state.isSignedIn,
      // Never restore a loading state from disk; a persisted `true` would
      // strand the app behind a spinner with no in-flight request.
      isAuthLoading: false,
    }),
  }
);
