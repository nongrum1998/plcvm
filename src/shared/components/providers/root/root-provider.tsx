import React from 'react';
import { useRootDetection } from '@hooks';
import { LoadingScreen } from '../../screens/loading-screen';
import { ErrorScreen } from '@components/screens';

interface Props {
  children: React.ReactNode;
}

/**
 * Application-level security gate.
 *
 * Renders its children only when the device passes integrity checks. In
 * production (`__DEV__ === false`) the provider consults
 * {@link useRootDetection} and:
 *
 * - shows a loading indicator while the native jailbreak/debugger checks are
 *   running,
 * - shows {@link ErrorScreen} when the device is jailbroken/rooted or has a
 *   debugger attached,
 * - otherwise renders `children`.
 *
 * The block screen is deliberately dismiss-free: no `onRetry` is passed to
 * {@link ErrorScreen}, so it renders no action button and the compromised
 * device cannot proceed into the app. This gate must not be weakened.
 *
 * In development the gate is bypassed entirely (`isBlocked` is always `false`)
 * so developers are never locked out of the app.
 *
 * @param props.children - The rest of the application tree.
 *
 * @example
 * <RootProvider>
 *   <App />
 * </RootProvider>
 */
export const RootProvider = ({ children }: Props) => {
  const { isChecking, isBlocked } = useRootDetection();

  if (isChecking) {
    return <LoadingScreen />;
  }

  if (isBlocked) {
    return (
      <ErrorScreen
        title="Device Not Verified"
        description="We could not verify the security of this device. Access to this app is restricted on jailbroken, rooted, or debugged devices to protect your account."
      />
    );
  }

  return <>{children}</>;
};
