import React, { useEffect } from 'react';
import { useCurrentLocation } from '@hooks';
import { LoadingScreen } from '../../screens/loading-screen';
import { PermissionStatus } from 'expo-location';
import { ErrorScreen } from '@components/screens/error-screen';
import { openSettings } from 'expo-linking';

/**
 * Mount gate that holds the app subtree until foreground location permission
 * is resolved.
 *
 * On mount the provider calls `requestPermission()` from
 * {@link useCurrentLocation}, but only while `permission` is still
 * `UNDETERMINED` or `null`. Re-requesting an already-decided permission is a
 * no-op on both platforms and can re-surface the OS prompt, so the request is
 * gated on the status rather than fired unconditionally on every mount. The
 * resulting `Location.PermissionStatus` is cached by the OS permission store.
 *
 * Renders {@link LoadingScreen} until permission resolves — `UNDETERMINED`,
 * `null`, or an in-flight `loading` — so `children` never mount before the
 * prompt is answered, then:
 *
 * - {@link ErrorScreen} with a retry handler that re-requests while the OS
 *   still allows it and otherwise deep-links to system Settings, when
 *   permission is anything other than `GRANTED`,
 * - otherwise `children` unchanged via a `React.Fragment` — this component
 *   adds no DOM and no layout of its own, so it can wrap the tree at any depth
 *   without affecting styles or accessibility trees.
 *
 * Note that this is a side-effect-only mount gate, **not** a context
 * provider: `useCurrentLocation` keeps `permission`, `location` and
 * `locationName` in local `useState`, and this component only destructures
 * `requestPermission`, so that state is discarded on render and is not
 * shared with descendants. Consumers that need coordinates or a
 * place name must call `useCurrentLocation()` themselves.
 *
 * The effect never awaits the returned promise, so a rejected permission
 * request surfaces as an unhandled rejection rather than an error boundary.
 *
 * @param props - Component props.
 * @param props.children - Subtree to render. Rendered as-is with no
 *   wrapping element.
 * @returns A React element rendering `props.children` unchanged, or a
 *   loading/error screen while permission is unresolved.
 * @example
 * ```tsx
 * export const App = () => (
 *   <LocationProvider>
 *     <RootNavigator />
 *   </LocationProvider>
 * );
 * ```
 * @example
 * ```tsx
 * // Read the location in a screen — the provider does not supply it.
 * const { getLocation, loading, locationName } = useCurrentLocation();
 * ```
 */
export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const { requestPermission, loading, permission, canAskAgain } = useCurrentLocation();
  const showLoadingScreen: boolean =
    permission === PermissionStatus.UNDETERMINED || permission === null || loading;

  useEffect(() => {
    async function getPermission() {
      if (permission === PermissionStatus.UNDETERMINED || permission === null) {
        await requestPermission();
      }
    }
    getPermission();
    return () => {};
  }, [requestPermission, permission]);

  const onRetry = () => {
    if (canAskAgain) {
      requestPermission();
    }
    openSettings();
  };

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  if (permission !== PermissionStatus.GRANTED) {
    return (
      <ErrorScreen
        title="Location Permission"
        description="Please allow access to use location to continue"
        retryLabel={!canAskAgain ? 'Open Settings' : 'Allow Location'}
        onRetry={onRetry}
      />
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};
