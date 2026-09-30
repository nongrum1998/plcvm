/**
 * @storage — shared persistence infrastructure for the workspace.
 *
 * Two exports with distinct jobs:
 *
 * - {@link createSecureStorage} and {@link createSecureStateStorage} adapt
 *   `expo-secure-store` to the zustand `StateStorage` contract for secrets and
 *   other small, sensitive values.
 * - {@link createPersistedStore} pre-wires a zustand store with `persist` and
 *   `devtools` over that storage.
 *
 * SecureStore is a keychain / Keystore entry, not a general database. Keep
 * persisted state small and sensitive; use plain `create` from zustand for
 * bulk or ephemeral state.
 */

export { createPersistedStore } from './create-persisted-store';
export type { Persisted, PersistedStoreConfig } from './create-persisted-store';

export { createSecureStateStorage, createSecureStorage } from './secure-storage';
export type { SecureStorage, SecureStorageOptions } from './secure-storage';

export { createStorageKey } from './storage-key';
