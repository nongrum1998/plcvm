import React from 'react';
import { View } from 'react-native';
import { useRootDetection } from '@hooks';
import { BlockedDeviceScreen } from '../../screens/block-device-screen';
import { LoadingScreen } from '../../screens/loading-screen';

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
 * - shows {@link BlockedDeviceScreen} when the device is jailbroken/rooted or
 *   has a debugger attached,
 * - otherwise renders `children`.
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
    return (
      <>
        <LoadingScreen />
      </>
    );
  }

  if (isBlocked) {
    return (
      <>
        <View className="flex-1 items-center justify-center bg-background">
          <BlockedDeviceScreen />
        </View>
      </>
    );
  }

  return <>{children}</>;
};
