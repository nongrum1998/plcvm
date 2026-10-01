import {
  FaceCaptureCameraView,
  type CameraPhase,
} from '@components/common/face-capture-camera-view';

/**
 * Props for {@link ProfileUpdateCamera}.
 */
export interface ProfileUpdateCameraProps {
  /** Called with the captured base64 image when a valid blink is detected. */
  onSubmit: (data: string) => void;
  /** Called when the user wants to go back to the previous step. */
  onReset: () => void;
  /** Current camera phase from the parent's state machine. */
  phase: CameraPhase;
  /** Callback fired when the camera phase should change. */
  onPhaseChange: (phase: CameraPhase) => void;
}

/**
 * Profile update camera step using the shared {@link FaceCaptureCameraView}.
 *
 * Wraps the shared camera view with profile-update-specific loading screen
 * and error messaging. The parent controls the phase state machine.
 *
 * @param props - {@link ProfileUpdateCameraProps}.
 * @returns The rendered profile update camera step.
 */
export function ProfileUpdateCamera({
  onSubmit,
  onReset,
  phase,
  onPhaseChange,
}: ProfileUpdateCameraProps) {
  return (
    <FaceCaptureCameraView
      phase={phase}
      onPhaseChange={onPhaseChange}
      onReset={onReset}
      onSubmit={onSubmit}
      loadingText="Submitting..."
      errorTitle="Camera Access not granted"
      errorDescription="Please allow camera access to continue"
      loadingCameraText="Loading Camera..."
      showLoadingOverlay={true}
      showFooterDuringLoading={false}
    />
  );
}
