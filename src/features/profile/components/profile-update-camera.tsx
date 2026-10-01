import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { FaceCaptureCamera } from '@components/common/face-capture-camera';
import { useFaceCapture } from '@hooks/use-face-capture';
import { Button, LoadingScreen } from '@components';
import { FooterImg } from '@components/common';
import { Container } from '@components/layout';
import { ErrorScreen } from '@components/screens/error-screen';

/**
 * Camera phases of the registration submit step.
 *
 * `capturing` is part of the union for historical parity, but it is never
 * transitioned to: capture + compression complete inside
 * {@link useFaceCapture} before `onCaptured` fires, so the first visible
 * transition is straight to `submitting` (or `error` on validation/capture
 * failure).
 */
type CameraPhase = 'camera' | 'capturing' | 'submitting' | 'error';

/**
 * Final step (3) of the pensioner registration wizard: liveness face
 * capture with automatic submission.
 *
 * Renders the shared {@link FaceCaptureCamera} powered by
 * {@link useFaceCapture}. Once a valid blink is detected and the photo is
 * captured + compressed, the base64 payload is validated with
 * {@link RegisterPensionerSchema} (against the wizard's stored formData)
 * and submitted through {@link useRegisterPensioner}. On success the store
 * `setSuccess()` replaces this screen with the success view; API or
 * validation failures show an inline error view with "Try Again" (resets
 * the blink state and returns to the camera) and "Back to Details"
 * (returns to step 2). Permission request mirrors the face-verification
 * screen and the loading gate fails closed while the camera is
 * unavailable.
 *
 * This component must be rendered as a top-level route step (definite
 * height) — never nested inside a ScrollView or padded container, or the
 * absolutely-positioned camera preview collapses to zero height and only
 * the overlay text remains visible. The registration screen bypasses its
 * scroll container on step 3 to guarantee this.
 *
 * @returns The rendered registration camera step.
 */
type ProfileUpdateCameraProps = {
  onSubmit: (data: string) => void;
  onReset: () => void;
  phase: CameraPhase;
  onPhaseChange: (phase: CameraPhase) => void;
};

export function ProfileUpdateCamera({
  onSubmit,
  onPhaseChange,
  phase,
  onReset,
}: ProfileUpdateCameraProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  /**
   * Validates the captured photo with the stored form data and submits the
   * registration. Called by {@link useFaceCapture} after capture + compress
   * complete, so the capture gate is already released when this runs.
   */
  const handleCaptured = async (cleanBase64: string) => {
    onPhaseChange('capturing');
    onSubmit(cleanBase64);
  };

  // Shared blink-liveness capture pipeline; inactive outside the camera
  // phase so no capture can start while submitting or showing an error.
  const capture = useFaceCapture({
    isActive: phase === 'camera',
    onCaptured: handleCaptured,
    onError: () => onPhaseChange('error'),
  });

  if (!hasPermission || !device) {
    return (
      <ErrorScreen
        title="Camera Access not granted"
        description="Please allow camera access to continue"
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      {phase === 'camera' && (
        <View
          className="flex-1"
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            capture.onLayout({ width, height });
          }}>
          <FaceCaptureCamera
            device={device}
            onReset={onReset}
            outputs={capture.outputs}
            faces={capture.faces}
            frameWidth={capture.frameSize.width}
            frameHeight={capture.frameSize.height}
            viewWidth={capture.layoutSize.width}
            viewHeight={capture.layoutSize.height}
            message={capture.message}
          />

          {/* Back to details — top-left over the live preview; inset below
              the status bar because the camera runs full-bleed */}
          <View className="absolute bottom-5 left-5 right-5">
            <Button size="lg" onPress={onReset}>
              Back
            </Button>
          </View>
        </View>
      )}

      {/* Submitting — full-screen loading overlay */}
      {(phase === 'capturing' || phase === 'submitting') && <LoadingScreen />}
    </SafeAreaView>
  );
}
