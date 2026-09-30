import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { FaceCaptureCamera } from '@components/common/face-capture-camera';
import { useFaceCapture } from '@hooks/use-face-capture';
import { Button } from '@components';
import { FooterImg } from '@components/common';
import { Container } from '@components/layout';
import { useRegisterPensioner } from '../hooks';
import { RegisterPensionerInput, RegisterPensionerSchema } from '../validators';
import { useRegistrationStore } from '../store';
import { useImageCompressor } from '@hooks/use-image-compressor';

/**
 * Camera phases of the registration submit step.
 *
 * `capturing` is part of the union for historical parity, but it is never
 * transitioned to: capture + compression complete inside
 * {@link useFaceCapture} before `onCaptured` fires, so the first visible
 * transition is straight to `submitting` (or `error` on validation/capture
 * failure).
 */
type RegistrationCameraPhase = 'camera' | 'capturing' | 'submitting' | 'error';

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
type RegistrationCameraProps = {
  onSubmit: (data: RegisterPensionerInput) => void;
};

export function RegistrationCamera({ onSubmit }: RegistrationCameraProps) {
  const { formData, prevStep } = useRegistrationStore();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [phase, setPhase] = useState<RegistrationCameraPhase>('camera');

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  /**
   * Validates the captured photo with the stored form data and submits the
   * registration. Called by {@link useFaceCapture} after capture + compress
   * complete, so the capture gate is already released when this runs.
   */
  const handleCaptured = async (cleanBase64: string) => {
    setPhase('submitting');
    const parsed = RegisterPensionerSchema.safeParse({ ...formData, image: cleanBase64 });
    if (!parsed.success) {
      return;
    }
    onSubmit(parsed.data);
  };

  // Shared blink-liveness capture pipeline; inactive outside the camera
  // phase so no capture can start while submitting or showing an error.
  const capture = useFaceCapture({
    isActive: phase === 'camera',
    onCaptured: handleCaptured,
    onError: () => setPhase('error'),
  });

  if (!hasPermission || !device) {
    return (
      <Container>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-base text-muted-foreground">Loading Camera...</Text>
          <FooterImg />
        </SafeAreaView>
      </Container>
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
            onReset={prevStep}
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
            <Button size="lg" onPress={prevStep}>
              Back
            </Button>
          </View>
        </View>
      )}

      {/* Submitting — full-screen loading overlay */}
      {(phase === 'capturing' || phase === 'submitting') && (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" />
          <Text className="text-base font-medium text-muted-foreground">
            {phase === 'capturing' ? 'Processing photo...' : 'Submitting registration...'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
