import { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { FaceCaptureCamera } from './face-capture-camera';
import { useFaceCapture } from '@hooks/use-face-capture';
import { FooterImg } from './nic-footer-img';
import { Container } from '../layout/container';

/**
 * Camera phase states for the shared face capture view.
 *
 * `capturing` is part of the union for historical parity, but it is never
 * transitioned to: capture + compression complete inside
 * {@link useFaceCapture} before `onCaptured` fires, so the first visible
 * transition is straight to `submitting` (or `error` on validation/capture
 * failure).
 */
export type CameraPhase = 'camera' | 'capturing' | 'submitting' | 'error';

/**
 * Props for {@link FaceCaptureCameraView}.
 *
 * This component encapsulates the shared camera rendering pipeline:
 * permission handling, device selection, FaceCaptureCamera rendering,
 * layout measurement, and the useFaceCapture hook. It is designed to be
 * controlled by a parent component that manages the phase state machine.
 *
 * @example
 * ```tsx
 * <FaceCaptureCameraView
 *   phase={phase}
 *   onPhaseChange={setPhase}
 *   onReset={() => setPhase('declaration')}
 *   onSubmit={async (base64) => { await submit(base64); }}
 *   loadingText="Submitting..."
 *   errorText="Camera Access not granted"
 *   errorDescription="Please allow camera access to continue"
 * />
 * ```
 */
export interface FaceCaptureCameraViewProps {
  /** Current camera phase from the parent's state machine. */
  phase: CameraPhase;
  /** Callback fired when the camera phase should change. */
  onPhaseChange: (phase: CameraPhase) => void;
  /** Called when the user taps the back/cancel action in the camera view. */
  onReset: () => void;
  /** Optional custom capture handler. If provided, this is called instead
   *  of the default flow (which calls onPhaseChange('capturing') then onSubmit).
   *  Use this for custom flows like going to a preview phase first. */
  onCaptured?: (cleanBase64: string) => void | Promise<void>;
  /** Optional custom error handler. If provided, this is called instead
   *  of the default onPhaseChange('error'). */
  onError?: (message: string) => void;
  /** Text shown during the capturing/submitting phases. */
  loadingText?: string;
  /** Title shown when camera permission is denied or device unavailable. */
  errorTitle?: string;
  /** Description shown when camera permission is denied or device unavailable. */
  errorDescription?: string;
  /** Optional custom message shown while loading the camera. */
  loadingCameraText?: string;
  /** Optional custom message shown while loading the camera. */
  loadingCameraDescription?: string;
  /** If true, requests camera permission on mount. If false, the parent
   *  is responsible for requesting permission (e.g., on user action).
   *  Default: true. */
  requestPermissionOnMount?: boolean;
  /** If true, renders the camera in a full-screen loading overlay when
   *  phase is `capturing` or `submitting`. Default: true. */
  showLoadingOverlay?: boolean;
  /** If true, shows the FooterImg during camera loading state. Default: true. */
  showFooterDuringLoading?: boolean;
  /** Optional custom loading overlay component. If provided, this is rendered
   *  instead of the default ActivityIndicator + text during capturing/submitting. */
  LoadingOverlay?: React.ReactNode;
}

/**
 * Full-screen front-camera surface for blink liveness capture with shared
 * permission handling, device selection, and layout measurement.
 *
 * Encapsulates the complete camera rendering pipeline used by registration,
 * profile update, and face verification features. The parent controls the
 * phase state machine and provides callbacks for capture submission, reset,
 * and phase transitions.
 *
 * Key responsibilities:
 * - Requests camera permission on mount (unless requestPermissionOnMount is false)
 * - Selects the front camera device
 * - Manages the `useFaceCapture` hook lifecycle
 * - Measures layout dimensions for face overlay scaling
 * - Renders `FaceCaptureCamera` during the `camera` phase
 * - Shows loading overlay during `capturing`/`submitting` phases
 * - Shows loading state when permission denied or device unavailable
 *
 * @param props - {@link FaceCaptureCameraViewProps}.
 * @returns The rendered camera view or loading/error state.
 */
export function FaceCaptureCameraView({
  phase,
  onPhaseChange,
  onReset,
  onCaptured,
  onError,
  loadingText = 'Submitting...',
  loadingCameraText = 'Loading Camera...',
  loadingCameraDescription,
  requestPermissionOnMount = true,
  showLoadingOverlay = true,
  showFooterDuringLoading = true,
  LoadingOverlay,
}: FaceCaptureCameraViewProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const isPermissionRequested = useRef(false);

  useEffect(() => {
    if (requestPermissionOnMount && !hasPermission && !isPermissionRequested.current) {
      isPermissionRequested.current = true;
      requestPermission();
    }
  }, [hasPermission, requestPermission, requestPermissionOnMount]);

  /**
   * Called by {@link useFaceCapture} after capture + compress complete.
   * If onCaptured is provided, delegates to it. Otherwise, transitions to
   * capturing phase then submits the base64 image.
   */
  const handleCaptured = async (cleanBase64: string) => {
    onPhaseChange('capturing');
    if (onCaptured) {
      await onCaptured(cleanBase64);
    }
  };

  /**
   * Called by {@link useFaceCapture} on capture/compression failure.
   * If onError is provided, delegates to it. Otherwise, transitions to error phase.
   */
  const handleCaptureError = (message: string) => {
    if (onError) {
      onError(message);
      return;
    }
    onPhaseChange('error');
  };

  // Shared blink-liveness capture pipeline; inactive outside the camera
  // phase so no capture can start while submitting or showing an error.
  const capture = useFaceCapture({
    isActive: phase === 'camera',
    onCaptured: handleCaptured,
    onError: handleCaptureError,
  });

  // Camera unavailable / permission denied state
  if (!hasPermission || !device) {
    return (
      <Container>
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-base text-muted-foreground">{loadingCameraText}</Text>
          {loadingCameraDescription && (
            <Text className="mt-2 text-sm text-muted-foreground">{loadingCameraDescription}</Text>
          )}
          {showFooterDuringLoading && <FooterImg />}
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
            onReset={onReset}
            outputs={capture.outputs}
            faces={capture.faces}
            frameWidth={capture.frameSize.width}
            frameHeight={capture.frameSize.height}
            viewWidth={capture.layoutSize.width}
            viewHeight={capture.layoutSize.height}
            message={capture.message}
          />
        </View>
      )}

      {/* Submitting — full-screen loading overlay */}
      {showLoadingOverlay &&
        (phase === 'capturing' || phase === 'submitting') &&
        (LoadingOverlay ?? (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="large" />
            <Text className="text-base font-medium text-muted-foreground">{loadingText}</Text>
          </View>
        ))}
    </SafeAreaView>
  );
}
