import { useEffect, useState } from 'react';
import { useCameraPermission } from 'react-native-vision-camera';
import { FaceCaptureCameraView } from '@components/common/face-capture-camera-view';
import { RegisterPensionerInput, RegisterPensionerSchema } from '../validators';
import { useRegistrationStore } from '../store';

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
 * Renders the shared {@link FaceCaptureCameraView} powered by
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
  const [phase, setPhase] = useState<RegistrationCameraPhase>('camera');

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  /**
   * Validates the captured photo with the stored form data and submits the
   * registration. Called by {@link FaceCaptureCameraView} after capture + compress
   * complete.
   */
  const handleSubmit = async (cleanBase64: string) => {
    setPhase('submitting');
    const parsed = RegisterPensionerSchema.safeParse({ ...formData, image: cleanBase64 });
    if (!parsed.success) {
      setPhase('error');
      return;
    }
    onSubmit(parsed.data);
  };

  return (
    <FaceCaptureCameraView
      phase={phase}
      onPhaseChange={setPhase}
      onReset={prevStep}
      onSubmit={handleSubmit}
      loadingText="Submitting registration..."
      errorTitle="Camera Access not granted"
      errorDescription="Please allow camera access to continue"
      loadingCameraText="Loading Camera..."
      showFooterDuringLoading={true}
    />
  );
}
