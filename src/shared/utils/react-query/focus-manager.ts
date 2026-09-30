import { focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

/**
 * Syncs the app foreground/background state with React Query's focus manager.
 *
 * Listens to React Native's `AppState` changes and marks React Query as
 * focused when the app enters the active state, so stale queries are
 * automatically refetched on app resume.
 *
 * @returns A cleanup function that removes the AppState subscription.
 */
export function setupFocusManager(): () => void {
  const subscription = AppState.addEventListener('change', (state) => {
    focusManager.setFocused(state === 'active');
  });

  return () => subscription.remove();
}
