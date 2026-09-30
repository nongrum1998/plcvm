import { useEffect } from 'react';
import { useAuthStore } from '@stores/auth.store';

type Props = {
  children: React.ReactNode;
};

/**
 * Hydrates the auth store once zustand persistence has finished loading.
 *
 * Mount this component at the root of the app so the persisted authentication
 * state (user, tokens, and flags) is rehydrated into memory before any
 * screens read it. It handles both cases: hydration already complete at mount
 * time and hydration that finishes later (subscribing via onFinishHydration).
 *
 * Renders its children unchanged and does not block rendering while
 * hydration is pending.
 *
 * @param props - The component props.
 * @param props.children - The child tree to render, typically the app
 *   navigator/screens.
 *
 * @returns The children wrapped in a fragment, or null while the effect
 *   cleanup runs.
 *
 * @example
 * <AuthInitializer>
 *   <RootNavigator />
 * </AuthInitializer>
 */
export const AuthInitializer = ({ children }: Props) => {
  const hydrate = useAuthStore((s) => s._hydrate);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      hydrate();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        hydrate();
      });
      return () => unsub();
    }
  }, [hydrate]);

  return <>{children}</>;
};
