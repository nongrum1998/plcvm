import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import {
  FaceCaptureCameraView,
  type CameraPhase,
} from '@components/common/face-capture-camera-view';
import { useFaceCapture } from '@hooks/use-face-capture';
import {
  FaceVerificationPhotoPreviewStep,
  FaceVerificationResultView,
  FaceVerificationDeclarationForm,
  FaceVerificationConfirmDialog,
  FaceVerificationLoadingView,
  FaceVerificationErrorView,
} from '../components';
import { useSubmitDLC } from '../hooks';
import type {
  DeclarationAnswer,
  DlcDeclarationDetails,
  FaceVerificationPhase,
  FaceVerificationRouteParams,
} from '../types';
import { useDlcStatus } from '@hooks/use-dlc-status';
import { useAuthStore } from '@stores/auth.store';
import { LoadingScreen } from '@components';

const CAMERA_PERMISSION_ERROR =
  'Camera access is required to capture your face photo. Please enable camera access in your device settings.';
const CAMERA_UNAVAILABLE_ERROR = 'The front camera is unavailable on this device.';
const CAPTURE_ERROR = 'We could not capture your photo. Please try again.';
const SUBMISSION_ERROR = 'We could not submit your face verification right now. Please try again.';
const CONFIRMATION_DESC =
  'By submitting this Declaration, you have agreed that the ' +
  'information furnished by you is true.\n\nAre you sure you want to submit?';

/** Props accepted by {@link FaceVerificationScreen}. */
type FaceVerificationScreenProps = FaceVerificationRouteParams;

/** Envelope-derived result state retained by the screen. */
type FaceVerificationResultState = {
  isSuccess: boolean;
  message: string;
};

/**
 * Normalizes a server declaration value to the only values supported by the
 * current DLC contract. Unknown, missing, and legacy values fail closed to
 * the safe `No` answer.
 */
function normalizeDeclarationAnswer(value: string | null | undefined): DeclarationAnswer {
  return value === '1' ? '1' : '0';
}

/**
 * Orchestrates the face-verification declaration, camera, preview, submission,
 * result, and technical-error phases.
 *
 * Camera permission is requested only after the user taps Scan Face. The
 * captured JPEG base64 and declarations remain in memory until submission
 * completes; a failed result or technical retry resets the capture pipeline
 * and returns to the same screen without changing the user's declarations.
 *
 * Uses the shared {@link FaceCaptureCameraView} for the camera phase.
 *
 * @returns The active face-verification phase for the current screen.
 */
export function FaceVerificationScreen() {
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const { data: dlcStatus } = useDlcStatus();
  const { user } = useAuthStore();

  const [phase, setPhase] = useState<FaceVerificationPhase>('declaration');
  const [capturedImageBase64, setCapturedImageBase64] = useState('');
  const [nec, setNec] = useState<DeclarationAnswer>('0');
  const [nmc, setNmc] = useState<DeclarationAnswer>('0');
  const [result, setResult] = useState<FaceVerificationResultState | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dlcDialogOpen, setDlcDialogOpen] = useState(false);

  const hasEditedNec = useRef(false);
  const hasEditedNmc = useRef(false);
  const scanRequestInFlight = useRef(false);
  const submissionInFlight = useRef(false);

  const { mutateAsync, isPending: isSubmitPending, reset: resetSubmission } = useSubmitDLC();

  useEffect(() => {
    if (!dlcStatus) return;

    if (!hasEditedNec.current) {
      setNec(normalizeDeclarationAnswer(dlcStatus.nec));
    }
    if (!hasEditedNmc.current) {
      setNmc(normalizeDeclarationAnswer(dlcStatus.nmc));
    }
  }, [dlcStatus]);

  const handleNecChange = useCallback((value: DeclarationAnswer) => {
    hasEditedNec.current = true;
    setNec(value);
  }, []);

  const handleNmcChange = useCallback((value: DeclarationAnswer) => {
    hasEditedNmc.current = true;
    setNmc(value);
  }, []);

  const showTechnicalError = useCallback((message: string) => {
    setResult(null);
    setErrorMsg(message);
    setPhase('error');
  }, []);

  const handleCapturedImage = useCallback(
    (rawBase64: string) => {
      if (!rawBase64) {
        showTechnicalError(CAPTURE_ERROR);
        return;
      }

      setCapturedImageBase64(rawBase64);
      setResult(null);
      setErrorMsg('');
      setPhase('preview');
    },
    [showTechnicalError]
  );

  const handleCaptureError = useCallback(
    (message: string) => {
      showTechnicalError(message);
    },
    [showTechnicalError]
  );

  const { resetCaptureState } = useFaceCapture({
    isActive: phase === 'camera',
    onCaptured: handleCapturedImage,
    onError: handleCaptureError,
  });

  const handleScanFace = useCallback(async () => {
    if (scanRequestInFlight.current || submissionInFlight.current) return;

    scanRequestInFlight.current = true;

    try {
      if (!hasPermission) {
        if (!canRequestPermission) {
          showTechnicalError(CAMERA_PERMISSION_ERROR);
          return;
        }

        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          showTechnicalError(CAMERA_PERMISSION_ERROR);
          return;
        }
      }

      if (!device) {
        showTechnicalError(CAMERA_UNAVAILABLE_ERROR);
        return;
      }

      setResult(null);
      setErrorMsg('');
      setPhase('camera');
    } catch {
      showTechnicalError(CAMERA_PERMISSION_ERROR);
    } finally {
      scanRequestInFlight.current = false;
    }
  }, [canRequestPermission, device, hasPermission, requestPermission, showTechnicalError]);

  const handleOpenConfirmation = useCallback(() => {
    if (!capturedImageBase64) {
      showTechnicalError(CAPTURE_ERROR);
      return;
    }
    setDlcDialogOpen(true);
  }, [capturedImageBase64, showTechnicalError]);

  const handleConfirmedSubmit = useCallback(async () => {
    if (submissionInFlight.current || isSubmitPending) return;

    setPhase('submitting');
    setDlcDialogOpen(false);
    setResult(null);
    setErrorMsg('');
    if (!capturedImageBase64) {
      showTechnicalError(CAPTURE_ERROR);
      return;
    }

    const ppoId = user?.ppo_id;
    const ppoNo = user?.ppo_no;

    if (!ppoId || !ppoNo) {
      setCapturedImageBase64('');
      resetSubmission();
      resetCaptureState();
      showTechnicalError(SUBMISSION_ERROR);
      return;
    }

    submissionInFlight.current = true;
    setPhase('submitting');

    try {
      const response = await mutateAsync({
        nec,
        nmc,
        image: capturedImageBase64,
      });

      if (
        !response ||
        typeof response.success !== 'boolean' ||
        typeof response.message !== 'string'
      ) {
        throw new Error('Invalid DLC response envelope');
      }

      setResult({
        isSuccess: response.success,
        message: response.message,
      });
      setPhase('result');
    } catch {
      setErrorMsg(SUBMISSION_ERROR);
      setPhase('error');
    } finally {
      // The raw image is needed only for this one request and is not retained
      // in screen state or the TanStack mutation variables after completion.
      setCapturedImageBase64('');
      resetSubmission();
      resetCaptureState();
      submissionInFlight.current = false;
    }
  }, [
    capturedImageBase64,
    isSubmitPending,
    mutateAsync,
    nec,
    nmc,
    resetCaptureState,
    resetSubmission,
    showTechnicalError,
    user?.ppo_id,
    user?.ppo_no,
  ]);

  const handleRetake = useCallback(() => {
    setCapturedImageBase64('');
    setResult(null);
    setErrorMsg('');
    resetSubmission();
    resetCaptureState();
    void handleScanFace();
  }, [handleScanFace, resetCaptureState, resetSubmission]);

  const handleReset = useCallback(() => {
    setCapturedImageBase64('');
    setResult(null);
    setErrorMsg('');
    setDlcDialogOpen(false);
    resetSubmission();
    resetCaptureState();
    setPhase('declaration');
  }, [resetCaptureState, resetSubmission]);

  const declaration: DlcDeclarationDetails = { nec, nmc };
  const showMarriageQuestion = user?.pclass === 'f';

  // Map FaceVerificationPhase to CameraPhase for the shared component
  const cameraPhase: CameraPhase =
    phase === 'camera' ? 'camera' : phase === 'submitting' ? 'submitting' : 'camera';

  if (isSubmitPending) return <LoadingScreen message="Please wait" />;
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <View className="flex-1">
        {/* Shared camera view for the camera phase */}
        {phase === 'camera' && (
          <FaceCaptureCameraView
            phase={cameraPhase}
            onPhaseChange={(newPhase) => setPhase(newPhase)}
            onReset={handleReset}
            onCaptured={handleCapturedImage}
            onError={handleCaptureError}
            showLoadingOverlay={true}
            LoadingOverlay={<FaceVerificationLoadingView />}
          />
        )}

        {phase === 'camera' && !device ? (
          <FaceVerificationErrorView
            errorMsg={CAMERA_UNAVAILABLE_ERROR}
            onTryAgainPress={handleRetake}
          />
        ) : null}

        {phase === 'preview' && (
          <FaceVerificationPhotoPreviewStep
            previewUri={capturedImageBase64 ? `data:image/jpeg;base64,${capturedImageBase64}` : ''}
            declaration={declaration}
            showMarriageQuestion={showMarriageQuestion}
            actionLabel="Submit Photo"
            onSubmitPress={handleOpenConfirmation}
            onReset={handleReset}
          />
        )}

        {phase === 'result' && result && (
          <FaceVerificationResultView
            isSuccess={result.isSuccess}
            message={result.message}
            onRetakePress={result.isSuccess ? undefined : handleRetake}
            onGoBack={() => setPhase('declaration')}
          />
        )}

        {phase === 'declaration' && (
          <FaceVerificationDeclarationForm
            nec={nec}
            nmc={nmc}
            onNecChange={handleNecChange}
            onNmcChange={handleNmcChange}
            onSubmit={() => void handleScanFace()}
          />
        )}

        {phase === 'error' && (
          <FaceVerificationErrorView errorMsg={errorMsg} onTryAgainPress={handleRetake} />
        )}
      </View>

      <FaceVerificationConfirmDialog
        open={dlcDialogOpen}
        onOpenChange={setDlcDialogOpen}
        title="Terms and Conditions."
        description={CONFIRMATION_DESC}
        destructive
        onConfirm={() => void handleConfirmedSubmit()}
      />
    </SafeAreaView>
  );
}

export type { FaceVerificationScreenProps };
