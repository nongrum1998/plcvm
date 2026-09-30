import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { MAX_IMAGE_SIZE_IN_KB } from '@utils/constants';

/**
 * Result of {@link useImageCompressor.compressImageToBase64 | compressImageToBase64}.
 *
 * Contains the re-encoded JPEG's temp-file URI, its base64 payload, and the
 * measured binary size. `uri` points to a cache file the caller should
 * delete after extracting `base64`.
 */
export interface CompressedImageResult {
  uri: string;
  base64: string;
  bytes: number;
  sizeKB: number;
  quality: number;
}

/**
 * Tuning options for {@link useImageCompressor.compressImageToBase64 | compressImageToBase64}.
 *
 * Re-encoding starts at `initialQuality` and steps down by `qualityStep`
 * until the base64 payload fits within `maxSizeKB`; quality never drops
 * below `minQuality`. All options are optional and have sensible defaults.
 */
export interface CompressImageOptions {
  maxSizeKB?: number;
  initialQuality?: number;
  minQuality?: number;
  qualityStep?: number;
}

/**
 * Compresses image files to a target size and returns their base64 payload.
 *
 * Uses the `expo-image-manipulator` context API (SDK 52+, `manipulateAsync`
 * is deprecated) to decode the source once and re-encode it as JPEG, stepping
 * quality from `initialQuality` down toward `minQuality` until the payload
 * fits within `maxSizeKB` (default 500 KB). Intermediate temp files that
 * overshoot the target are deleted as it iterates. Resolves with the
 * compressed result, or rejects with an {@link Error} when the image cannot
 * be reduced to the target size (the final attempt's temp file is deleted
 * first).
 *
 * @returns `compressImageToBase64` plus reactive `isCompressing`, `error`,
 * `result`, and `reset` state for callers that render progress status. Reset
 * also retries cleanup of any compressor-owned temporary file.
 */
export function useImageCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressedImageResult | null>(null);
  const pendingFileUris = useRef<Set<string>>(new Set());

  /**
   * Deletes compressor-owned temporary files that have not yet been removed.
   *
   * A URI remains tracked when deletion fails so reset or unmount can retry it.
   * Every URI is attempted even when one deletion fails.
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
        } catch (deleteError) {
          if (!hasError) {
            firstError = deleteError;
            hasError = true;
          }
        }
      })
    );

    if (hasError) {
      throw firstError;
    }
  }, []);

  /** Retries failed compressor temp-file deletion without leaking a rejection. */
  const retryPendingFileCleanup = useCallback(() => {
    void cleanupPendingFiles().catch(() => undefined);
  }, [cleanupPendingFiles]);

  useEffect(() => {
    return () => {
      retryPendingFileCleanup();
    };
  }, [retryPendingFileCleanup]);

  const compressImageToBase64 = useCallback(
    async (
      imageUri: string,
      options: CompressImageOptions = {}
    ): Promise<CompressedImageResult> => {
      const {
        maxSizeKB = MAX_IMAGE_SIZE_IN_KB,
        initialQuality = 0.85,
        minQuality = 0.3,
        qualityStep = 0.05,
      } = options;

      setIsCompressing(true);
      setError(null);
      setResult(null);

      try {
        const maxSizeBytes = maxSizeKB * 1024;

        // Decode the source once via the context API, then re-encode per save
        // attempt by walking quality down until the payload fits.
        const context = ImageManipulator.manipulate(imageUri);
        const renderedImage = await context.renderAsync();

        let quality = initialQuality;

        while (quality >= minQuality) {
          const savedImage = await renderedImage.saveAsync({
            compress: quality,
            format: SaveFormat.JPEG,
            base64: true,
          });
          pendingFileUris.current.add(savedImage.uri);

          if (!savedImage.base64) {
            throw new Error('Failed to generate base64 image');
          }

          // Base64 represents approximately 4/3 of the
          // original binary data.
          const bytes = Math.ceil((savedImage.base64.length * 3) / 4);

          if (bytes <= maxSizeBytes) {
            const compressedResult: CompressedImageResult = {
              uri: savedImage.uri,
              base64: savedImage.base64,
              bytes,
              sizeKB: bytes / 1024,
              quality,
            };

            setResult(compressedResult);

            return compressedResult;
          }

          // Overshooting iteration: remove its temp output before retrying lower.
          await cleanupPendingFiles();

          quality -= qualityStep;
        }

        // Final attempt at minimum quality.
        const finalImage = await renderedImage.saveAsync({
          compress: minQuality,
          format: SaveFormat.JPEG,
          base64: true,
        });
        pendingFileUris.current.add(finalImage.uri);

        if (!finalImage.base64) {
          throw new Error('Failed to generate base64 image');
        }

        const bytes = Math.ceil((finalImage.base64.length * 3) / 4);

        if (bytes > maxSizeBytes) {
          await cleanupPendingFiles();
          throw new Error(
            `Unable to compress image below ${maxSizeKB} KB. ` +
              `Final size: ${(bytes / 1024).toFixed(2)} KB`
          );
        }

        const compressedResult: CompressedImageResult = {
          uri: finalImage.uri,
          base64: finalImage.base64,
          bytes,
          sizeKB: bytes / 1024,
          quality: minQuality,
        };

        setResult(compressedResult);

        return compressedResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to compress image';

        setError(message);
        retryPendingFileCleanup();

        throw err;
      } finally {
        setIsCompressing(false);
      }
    },
    [cleanupPendingFiles, retryPendingFileCleanup]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsCompressing(false);
    retryPendingFileCleanup();
  }, [retryPendingFileCleanup]);

  return {
    compressImageToBase64,
    isCompressing,
    error,
    result,
    reset,
  };
}
