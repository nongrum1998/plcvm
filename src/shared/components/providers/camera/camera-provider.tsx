import React, { useEffect, PropsWithChildren } from 'react';
import { openSettings } from 'expo-linking';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { ErrorScreen } from '@components/screens/error-screen';
import { LoadingScreen } from '@components/screens';

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
    return <LoadingScreen message="Loading Camera" />;
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
        retryLabel="Try Again"
        onRetry={() => {}}
      />
    );
  }

  // Reject virtual cameras.
  if (frontCamera.isVirtualDevice) {
    return (
      <ErrorScreen
        title="Unsupported Camera"
        description="A physical front camera is required to continue."
        retryLabel="Try Again"
        onRetry={() => {}}
      />
    );
  }

  return <>{children}</>;
};
