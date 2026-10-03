import { useEffect, PropsWithChildren } from 'react';
import { openSettings } from 'expo-linking';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { ErrorScreen } from '@components/screens/error-screen';
import { LoadingScreen } from '@components/screens/loading-screen';

/**
 * Mount gate that holds the app subtree until camera access is resolved.
 *
 * Requests the vision-camera permission exactly once, and only while the
 * status is still `'not-determined'` — re-requesting an already-decided
 * permission is a no-op on both platforms and can re-surface the OS prompt on
 * some Android builds.
 *
 * Renders, in order:
 * - {@link LoadingScreen} while the status is `'not-determined'`,
 * - {@link ErrorScreen} when permission is `'denied'`, whose `onRetry`
 *   re-requests while the OS still permits it and otherwise deep-links to
 *   system Settings,
 * - {@link ErrorScreen} with **no** action button when no front camera exists.
 *   Missing hardware is not something a retry or a Settings trip can fix, so
 *   no `onRetry` is passed — rendering a "Try Again" button here would be a
 *   dead affordance,
 * - otherwise `children`.
 *
 * Like {@link LocationProvider}, this is a side-effect-only mount gate rather
 * than a context provider: it shares no camera state, so descendants that need
 * the device must call `useCameraDevice`/`useCameraPermission` themselves.
 *
 * Note: `requestPermission()` is awaited inside `getPermission`, but the effect
 * invokes `getPermission()` without awaiting or catching it, so a rejected
 * request surfaces as an unhandled rejection rather than an error boundary.
 *
 * @param props.children - Subtree to render once the camera gate resolves.
 * @returns The gated subtree, or a loading/error screen while unresolved.
 * @example
 * ```tsx
 * export const App = () => (
 *   <CameraProvider>
 *     <RootNavigator />
 *   </CameraProvider>
 * );
 * ```
 */
export const CameraProvider = ({ children }: PropsWithChildren) => {
  const { requestPermission, status, canRequestPermission } = useCameraPermission();

  const frontCamera = useCameraDevice('front');

  useEffect(() => {
    async function getPermission() {
      if (status === 'not-determined') {
        await requestPermission();
      }
    }

    getPermission();
    return () => {};
  }, [status, requestPermission]);

  const onRetry = async () => {
    if (canRequestPermission) {
      await requestPermission();
      return;
    }

    await openSettings();
  };

  if (status === 'not-determined') {
    return <LoadingScreen />;
  }

  if (status === 'denied') {
    return (
      <ErrorScreen
        title="Camera Permission"
        description="Please allow access to use the camera to continue."
        retryLabel={canRequestPermission ? 'Allow Camera Access' : 'Open Settings'}
        onRetry={onRetry}
      />
    );
  }

  if (!frontCamera) {
    return (
      <ErrorScreen
        title="Camera Unavailable"
        description="A front camera could not be found on this device."
      />
    );
  }

  return <>{children}</>;
};
