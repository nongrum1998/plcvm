import { useEffect } from 'react';
import { useAuthStore } from '@stores/auth.store';

type Props = {
  children: React.ReactNode;
};

/**
 * Restores the auth session once, at app start.
 *
 * Mount this component at the root of the app so the cached profile and the
 * stored token are resolved into memory before any screens read the store.
 * {@link useAuthStore._hydrate} reads the keychain cache and, whenever a token
 * is present, refreshes the profile from the API.
 *
 * Renders its children unchanged and does not block rendering. The redirect
 * gate is driven separately: `isAuthLoading` starts `true` and `AuthRedirect`
 * shows a loading screen until hydration settles.
 *
 * @param props - The component props.
 * @param props.children - The child tree to render, typically the app
 *   navigator/screens.
 *
 * @returns The children wrapped in a fragment.
 *
 * @example
 * <AuthInitializer>
 *   <RootNavigator />
 * </AuthInitializer>
 */
export const AuthInitializer = ({ children }: Props) => {
  const hydrate = useAuthStore((s) => s._hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return <>{children}</>;
};
