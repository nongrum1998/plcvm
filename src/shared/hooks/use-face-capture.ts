import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePhotoOutput, type CameraOutput } from 'react-native-vision-camera';
import { createFaceDetectorOutput, type Face } from 'react-native-vision-camera-face-detector';
import * as FileSystem from 'expo-file-system/legacy';
import { useImageCompressor } from './use-image-compressor';

/** A 2D size in points used for face-overlay coordinate scaling. */
export interface FaceCaptureSize {
  width: number;
  height: number;
}

/** Options for {@link useFaceCapture}. */
export interface UseFaceCaptureOptions {
  /**
   * Called with the whitespace-trimmed JPEG base64 after capture and
   * compression succeed. The parent owns what happens next (submit,
   * preview, etc.). May be async.
   */
  onCaptured: (cleanBase64: string) => void | Promise<void>;

  /**
   * Called when capture or compression fails, after the internal message
   * has been updated and the capture gate has been released. Receives the
   * thrown error message. Parents typically switch to an error phase here.
   */
  onError?: (message: string) => void;

  /**
   * When false, the blink-detection handler is ignored (the live camera
   * keeps running). Pass `phase === 'camera'` from the parent state machine.
   */
  isActive: boolean;
}

/** Result of {@link useFaceCapture}. */
export interface UseFaceCaptureResult {
  /** Latest detected faces, painted by the shared camera overlay. */
  faces: Face[];
  /** Current liveness instruction shown in the camera banner. */
  message: string;
  /** Replaces the liveness instruction. */
  setMessage: (message: string) => void;
  /** Screen-space dimensions of the wrapping `onLayout` view. */
  layoutSize: FaceCaptureSize;
  /** `onLayout` handler for the view that wraps the camera. */
  onLayout: (size: FaceCaptureSize) => void;
  /** Detector-frame dimensions for coordinate scaling. */
  frameSize: FaceCaptureSize;
  /** Native face-detection callback; wire to the detector's `onFacesDetected`. */
  handleDetectedFaces: (faces: Face[]) => void;
  /** Photo output for capture, passed to `<Camera outputs>`. */
  photoOutput: ReturnType<typeof usePhotoOutput>;
  /** Memoized outputs array `[faceDetectorOutput, photoOutput]` for `<Camera>`. */
  outputs: CameraOutput[];
  /** Resets blink counting, eye state, processing flag, and the banner
   *  message back to `'Please blink!!'` (e.g. after preview approval or a
   *  retry). Does NOT touch the capture gate. */
  resetBlinkState: () => void;
  /**
   * Resets the complete capture pipeline for a same-screen retake.
   *
   * Clears the capture gate, blink/eye state, processing and detection
   * timestamps, detected faces, compressor state, and the liveness message.
   * It also invalidates in-flight captures and retries any temporary file
   * cleanup that previously failed.
   */
  resetCaptureState: () => void;
}

/**
 * Shared front-camera face-capture machinery with blink liveness detection.
 *
 * Owns the photo output, the face-detector output, the blink state machine
 * (yaw ≤28°, pitch ≤32°, centered 30–70%, face ≥20% of frame, eyes closed
 * <0.35 / open >0.6, 800 ms throttle), and the capture → compress → temp-file
 * cleanup pipeline. When a successful blink sequence is detected it captures
 * one photo, compresses it to ≤500 KB base64, deletes the temp files, and
 * resolves {@link UseFaceCaptureOptions.onCaptured | onCaptured} with the
 * trimmed base64. Capture/compression failures release the capture gate,
 * update the banner message, and call `onError`.
 *
 * Use this from both the face-verification screen and the registration
 * camera so the detection rules and capture pipeline stay in one place.
 *
 * IMPORTANT: the face-detector output is created exactly ONCE in an effect.
 * Do NOT switch to `useFaceDetectorOutput()` here — it memoizes on its
 * rest-options object, which is re-created every render, so it returns a
 * new native output each render and `<Camera outputs>` tears down and
 * rebuilds the camera session (unbindAll) on every render, aborting
 * in-flight captures with "ImageCaptureException: Camera is closed".
 *
 * @param options - Hook options (see {@link UseFaceCaptureOptions}).
 * @returns Detection state, the capture pipeline, and helpers.
 */
export function useFaceCapture({
  onCaptured,
  onError,
  isActive,
}: UseFaceCaptureOptions): UseFaceCaptureResult {
  // Photo output for capture (v5 outputs API)
  const photoOutput = usePhotoOutput({
    qualityPrioritization: 'speed',
  });

  const { compressImageToBase64, reset } = useImageCompressor();

  // Detection state
  const [faces, setFaces] = useState<Face[]>([]);
  const [message, setMessage] = useState('Please blink!!');
  const [layoutSize, setLayoutSize] = useState<FaceCaptureSize>({ width: 0, height: 0 });
  const [frameSize, setFrameSize] = useState<FaceCaptureSize>({ width: 0, height: 0 });

  // Operational refs
  const activeRef = useRef(isActive);
  const frameSizeRef = useRef<FaceCaptureSize>({ width: 0, height: 0 });
  const isProcessing = useRef(false);
  const isCapturing = useRef(false);
  const lastDetectionTime = useRef(0);
  const eyesClosed = useRef(false);
  const blinkCount = useRef(0);
  const captureGeneration = useRef(0);
  const isMountedRef = useRef(true);
  const pendingFileUris = useRef<Set<string>>(new Set());
  // Latest-ref holder so the natively-captured callback always reaches the
  // freshest `handleDetectedFaces` without changing output identity.
  const detectedFacesHandlerRef = useRef<{ current?: (faces: Face[]) => void }>({});

  // Keep the detection gate in sync with the parent's phase machine.
  useEffect(() => {
    activeRef.current = isActive;
  });

  /**
   * Deletes every temporary file that has not yet been confirmed removed.
   *
   * A failed delete is intentionally left in {@link pendingFileUris} so a later
   * reset or unmount can retry it. All pending files are attempted even when
   * one URI fails, and the first cleanup error is reported to the caller.
   */
  const cleanupPendingFiles = useCallback(async (): Promise<void> => {
    const uris = Array.from(pendingFileUris.current);
    if (uris.length === 0) return;

    let firstError: unknown;
    let hasError = false;

    await Promise.all(
      uris.map(async (uri) => {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
          pendingFileUris.current.delete(uri);
        } catch (error) {
          if (!hasError) {
            firstError = error;
            hasError = true;
          }
        }
      })
    );

    if (hasError) {
      throw firstError;
    }
  }, []);

  /**
   * Retries pending cleanup without surfacing an unhandled promise rejection.
   * Failed URIs remain tracked for a later reset or unmount attempt.
   */
  const retryPendingFileCleanup = useCallback(() => {
    void cleanupPendingFiles().catch(() => undefined);
  }, [cleanupPendingFiles]);

  useEffect(() => {
    isMountedRef.current = true;
    const facesHandlerRef = detectedFacesHandlerRef;

    return () => {
      isMountedRef.current = false;
      activeRef.current = false;
      captureGeneration.current += 1;
      facesHandlerRef.current.current = undefined;
      retryPendingFileCleanup();
    };
  }, [retryPendingFileCleanup]);

  /**
   * Checks whether an asynchronous capture still belongs to the active mount.
   * Reset and unmount increment the generation, invalidating late callbacks.
   */
  const isCaptureCurrent = useCallback(
    (generation: number) =>
      isMountedRef.current && activeRef.current && generation === captureGeneration.current,
    []
  );

  /**
   * Captures a single photo, compresses it to ≤500 KB base64, deletes the
   * temp files, and hands the trimmed base64 to `onCaptured`. On any
   * failure the capture gate is released, the banner message is updated,
   * and `onError` is invoked. Captures invalidated by reset or unmount are
   * cleaned without notifying the parent.
   */
  const capturePhoto = useCallback(async () => {
    const generation = captureGeneration.current;

    try {
      isCapturing.current = true;
      setMessage('Capturing photo...');

      // 1. Capture snapshot while <Camera /> is still mounted and active
      const photoFile = await photoOutput.capturePhotoToFile({}, {});

      const filePath = photoFile.filePath.startsWith('file://')
        ? photoFile.filePath
        : `file://${photoFile.filePath}`;
      pendingFileUris.current.add(filePath);

      if (!isCaptureCurrent(generation)) {
        await cleanupPendingFiles();
        isCapturing.current = false;
        if (isMountedRef.current) reset();
        return;
      }

      setMessage('Please wait...');

      // Clear stale result/error state left by a previous capture.
      reset();

      // 2. Always compress to ≤500 KB before base64-encoding.
      let cleanBase64 = '';
      try {
        const compressed = await compressImageToBase64(filePath);
        pendingFileUris.current.add(compressed.uri);

        if (!isCaptureCurrent(generation)) {
          isCapturing.current = false;
          if (isMountedRef.current) reset();
          return;
        }

        // ImageManipulator emits whitespace-free base64; strip defensively to
        // keep the exact payload format the API previously received.
        cleanBase64 = compressed.base64.replace(/[\r\n\s]/g, '');
      } finally {
        // Delete both temporary files before notifying the parent. This keeps
        // biometric files out of the filesystem for the entire time the
        // parent is processing the captured image.
        await cleanupPendingFiles();
      }

      if (!cleanBase64) {
        throw new Error('Failed to generate base64 image');
      }

      if (!isCaptureCurrent(generation)) {
        isCapturing.current = false;
        if (isMountedRef.current) reset();
        return;
      }

      await onCaptured(cleanBase64);
      activeRef.current = false;
      isCapturing.current = false;
    } catch (e) {
      const captureIsCurrent = isCaptureCurrent(generation);

      // CRITICAL: both statements below are required. Dropping either leaves
      // the loading spinner up forever and deadlocks the blink-capture gate
      // (`blinkCount.current > 0 && !isCapturing.current`).
      isCapturing.current = false;
      retryPendingFileCleanup();

      if (!captureIsCurrent) {
        if (isMountedRef.current) reset();
        return;
      }

      reset();
      const message = e instanceof Error ? e.message : 'Failed to capture image';
      setMessage(message);
      onError?.(message);
    }
  }, [
    photoOutput,
    compressImageToBase64,
    cleanupPendingFiles,
    isCaptureCurrent,
    reset,
    onCaptured,
    onError,
    retryPendingFileCleanup,
  ]);

  // Face detection callback
  const handleDetectedFaces = useCallback(
    (detectedFaces: Face[]) => {
      if (
        !isMountedRef.current ||
        isCapturing.current ||
        isProcessing.current ||
        !activeRef.current
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastDetectionTime.current < 800) return;
      lastDetectionTime.current = now;
      isProcessing.current = true;

      setFaces(detectedFaces);

      const frame = detectedFaces[0];
      const frameWidth = frame?.frameWidth ?? frameSizeRef.current.width;
      const frameHeight = frame?.frameHeight ?? frameSizeRef.current.height;

      if (
        frameWidth &&
        frameHeight &&
        (frameSizeRef.current.width !== frameWidth || frameSizeRef.current.height !== frameHeight)
      ) {
        frameSizeRef.current = { width: frameWidth, height: frameHeight };
        setFrameSize(frameSizeRef.current);
      }

      if (detectedFaces.length === 0) {
        setMessage('No Face Detected');
        isProcessing.current = false;
        return;
      }

      if (detectedFaces.length > 1) {
        setMessage('Multiple Faces Detected');
        isProcessing.current = false;
        return;
      }

      const face = detectedFaces[0];
      const yaw = face.yawAngle ?? 0;
      const pitch = face.pitchAngle ?? 0;

      if (Math.abs(yaw) >= 28 || Math.abs(pitch) >= 32) {
        setMessage('Please look straight');
        isProcessing.current = false;
        return;
      }

      const centerX = face.bounds.x + face.bounds.width / 2;
      const centerY = face.bounds.y + face.bounds.height / 2;
      const isCentered =
        centerX > frameWidth * 0.3 &&
        centerX < frameWidth * 0.7 &&
        centerY > frameHeight * 0.3 &&
        centerY < frameHeight * 0.7;

      if (!isCentered) {
        setMessage('Center your face');
        isProcessing.current = false;
        return;
      }

      const isLargeEnough =
        face.bounds.width > frameWidth * 0.2 && face.bounds.height > frameHeight * 0.2;

      if (!isLargeEnough) {
        setMessage('Move closer to camera');
        isProcessing.current = false;
        return;
      }

      setMessage('Blink your eyes');

      const leftEye = face.leftEyeOpenProbability ?? -1;
      const rightEye = face.rightEyeOpenProbability ?? -1;

      if (leftEye === -1 || rightEye === -1) {
        setMessage('Blink detection unsupported');
        isProcessing.current = false;
        return;
      }

      const isClosed = leftEye < 0.35 && rightEye < 0.35;
      const isOpen = leftEye > 0.6 && rightEye > 0.6;

      if (isClosed && !eyesClosed.current) {
        eyesClosed.current = true;
        setMessage('Eyes Closed');
        isProcessing.current = false;
        return;
      }

      if (isOpen && eyesClosed.current) {
        eyesClosed.current = false;
        blinkCount.current += 1;
        setMessage('Blink Detected');
      }

      if (blinkCount.current > 0 && !isCapturing.current) {
        void capturePhoto();
      }

      isProcessing.current = false;
    },
    [capturePhoto]
  );

  // Native face-detector output, created exactly ONCE (in an effect) for
  // this hook's lifetime. See the hook doc comment for why
  // `useFaceDetectorOutput()` must NOT be used here.
  const [faceDetectorOutput, setFaceDetectorOutput] = useState<CameraOutput | null>(null);

  useEffect(() => {
    const output = createFaceDetectorOutput({
      performanceMode: 'accurate',
      runLandmarks: true,
      runClassifications: true,
      onFacesDetected: (detectedFaces) => {
        detectedFacesHandlerRef.current.current?.(detectedFaces);
      },
      onError: (error: unknown) => {
        if (__DEV__) {
          console.error('Face detection error:', error);
        }
      },
    });
    setFaceDetectorOutput(output);
    // Nitro hybrids are GC-managed; no eager dispose() needed on unmount.
  }, []);

  // Point the detector at the freshest handler after every render.
  useEffect(() => {
    detectedFacesHandlerRef.current.current = handleDetectedFaces;
  });

  // Memoized outputs — identity-stable, so <Camera> configures its native
  // session once per mount instead of tearing it down on every render.
  const outputs = useMemo(
    () => (faceDetectorOutput ? [faceDetectorOutput, photoOutput] : []),
    [faceDetectorOutput, photoOutput]
  );

  const onLayout = useCallback((size: FaceCaptureSize) => {
    setLayoutSize(size);
  }, []);

  const resetBlinkState = useCallback(() => {
    blinkCount.current = 0;
    eyesClosed.current = false;
    isProcessing.current = false;
    setMessage('Please blink!!');
  }, []);

  const resetCaptureState = useCallback(() => {
    captureGeneration.current += 1;
    activeRef.current = false;
    resetBlinkState();
    // Keep an in-flight capture gate closed until its stale run reaches its
    // own finally block, so a replacement capture cannot overlap cleanup.
    lastDetectionTime.current = 0;
    setFaces([]);
    reset();
    retryPendingFileCleanup();
  }, [reset, resetBlinkState, retryPendingFileCleanup]);

  return {
    faces,
    message,
    setMessage,
    layoutSize,
    onLayout,
    frameSize,
    handleDetectedFaces,
    photoOutput,
    outputs,
    resetBlinkState,
    resetCaptureState,
  };
}
