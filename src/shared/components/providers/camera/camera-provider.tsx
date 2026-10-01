import React, { useEffect } from 'react';
import { ErrorScreen } from '@components/screens/error-screen';
import { useCameraPermission } from 'react-native-vision-camera';
import { openSettings } from 'expo-linking';
import { LoadingScreen } from '@components/screens';

export const CameraProvider = ({ children }: { children: React.ReactNode }) => {
  const { requestPermission, status, canRequestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const onRetry = () => {
    if (canRequestPermission) {
      requestPermission();
      return;
    }
    openSettings();
    return;
  };

  if (status === 'not-determined') return <LoadingScreen message="Loading Camera" />;

  if (status === 'denied') {
    return (
      <ErrorScreen
        title="Camera Permission"
        description="Please allow access to use Camera to continue"
        retryLabel={canRequestPermission ? 'Allow Camera Access' : 'Open Settings'}
        onRetry={onRetry}
      />
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};
