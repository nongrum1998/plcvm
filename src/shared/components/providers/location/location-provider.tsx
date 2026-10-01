import React, { useEffect } from 'react';
import { useCurrentLocation } from '@hooks';
import { LoadingScreen } from '../../screens/loading-screen';
import { PermissionStatus } from 'expo-location';
import { ErrorScreen } from '@components/screens/error-screen';
import { openSettings } from 'expo-linking';

/**
 * Mounts the app subtree and eagerly requests foreground location
 * permission.
 *
 * On mount the provider calls `requestPermission()` from
 * {@link useCurrentLocation}, which triggers the native Expo permission
 * prompt exactly once per mount and caches the resulting
 * `Location.PermissionStatus` in the OS permission store. `children`
 * are rendered unchanged via a `React.Fragment` — this component adds
 * no DOM and no layout of its own, so it can wrap the tree at any depth
 * without affecting styles or accessibility trees.
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
 * @returns A React element rendering `props.children` unchanged.
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

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const onRetry = () => {
    if (canAskAgain) {
      requestPermission();
    }
    openSettings();
  };

  if (loading || permission === null) {
    return <LoadingScreen message="Requesting Location" />;
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
