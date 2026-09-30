import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

import { createSecureStateStorage, createSecureStorage } from './secure-storage';
import type { SecureStorageOptions } from './secure-storage';
import { createStorageKey } from './storage-key';

/**
 * Shape persisted to disk. Defaults to a shallow subset of the store, so
 * callers normally narrow this with `partialize` to the durable fields only.
 */
export type Persisted<T extends object> = Partial<T>;

/**
 * Configuration for {@link createPersistedStore}.
 *
 * @typeParam T - The store's state shape.
 * @typeParam U - The subset of `T` actually written to storage.
 */
export interface PersistedStoreConfig<T extends object, U = Persisted<T>> {
  /**
   * Unique store name. Used as the zustand `persist` key and the devtools
   * label. The underlying storage key is namespaced to
   * `pension.<name>`, so names must satisfy the `expo-secure-store` key rule
   * (`/^[\w.-]+$/`) — no colons.
   */
  name: string;
  /**
   * Restricts which state keys are written. Without this the entire store is
   * serialized on every write.
   */
  partialize?: (state: T) => U;
  /**
   * Persisted schema version. Required whenever `migrate` is supplied.
   */
  version?: number;
  /**
   * Upgrades previously persisted state. Receives the stored value and the
   * version it was written with.
   */
  migrate?: (persistedState: unknown, version: number) => U | Promise<U>;
  /**
   * SecureStore options, e.g. a `keychainService` or accessibility class.
   * See {@link SecureStorageOptions}.
   */
  secureStorage?: SecureStorageOptions;
}

/**
 * Wraps a `StateStorage` so every key is namespaced through
 * {@link createStorageKey}.
 *
 * Keeps the zustand `name` (and therefore the devtools label) free of the
 * `pension.` prefix while still isolating workspace keys, and rejects invalid
 * names at store construction rather than at the first native keychain call.
 */
const withNamespace = (storage: StateStorage): StateStorage => ({
  getItem: (name) => storage.getItem(createStorageKey(name)),
  setItem: (name, value) => storage.setItem(createStorageKey(name), value),
  removeItem: (name) => storage.removeItem(createStorageKey(name)),
});

/**
 * Creates a zustand store whose state is persisted to `expo-secure-store`
 * through zustand's `persist` middleware, with `devtools` composed in.
 *
 * Only use this for stores holding **small, sensitive** state (an auth
 * session, a token, a chosen identifier). SecureStore entries are keychain /
 * Keystore items, not a general database — large state is slow to write and
 * unsuitable on Android. Ephemeral UI state (snackbars, transient dialogs)
 * should use plain `create` from zustand and not be persisted at all.
 *
 * State is written back on every mutation, so keep the persisted subset small
 * via `partialize`.
 *
 * @typeParam T - The store's state shape.
 * @typeParam U - The subset of `T` written to storage.
 * @param initializer The zustand state creator, as passed to `create`.
 * @param config Persistence configuration. `name` is required.
 * @returns A bound zustand store hook. The return type is inferred so it keeps
 *   the `persist` and `devtools` mutators that `create` attaches, making
 *   `store.persist.hasHydrated()`, `store.persist.onFinishHydration()` and
 *   `store.persist.rehydrate()` available to consumers.
 * @throws {TypeError} If `name` contains characters `expo-secure-store`
 *   rejects, surfaced eagerly by the namespacing key builder.
 *
 * @example
 * interface AuthState {
 *   token: string | null;
 *   setToken: (token: string | null) => void;
 * }
 *
 * const useAuthStore = createPersistedStore<AuthState>(
 *   (set) => ({
 *     token: null,
 *     setToken: (token) => set({ token }),
 *   }),
 *   {
 *     name: 'auth',
 *     partialize: (state) => ({ token: state.token }),
 *     version: 1,
 *   },
 * );
 */
export const createPersistedStore = <T extends object, U = Persisted<T>>(
  initializer: StateCreator<T, [], [], T>,
  config: PersistedStoreConfig<T, U>
) => {
  const secure = createSecureStateStorage(createSecureStorage(config.secureStorage));
  const storage = createJSONStorage<U>(() => withNamespace(secure));

  return create<T>()(
    devtools(
      persist(initializer, {
        name: config.name,
        storage: storage ?? undefined,
        partialize: config.partialize,
        version: config.version,
        migrate: config.migrate,
      })
    )
  );
};
