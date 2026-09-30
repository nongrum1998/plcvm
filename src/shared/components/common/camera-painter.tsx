import React from 'react';
import { View, Text } from 'react-native';
import type { Face } from 'react-native-vision-camera-face-detector';

/** Props for {@link FaceVerificationPainter}. */
interface CameraPainterProps {
  faces: Face[];
  frameWidth: number;
  frameHeight: number;
  viewWidth: number;
  viewHeight: number;
  isFrontCamera?: boolean;
}

/**
 * Overlays detected-face bounding boxes onto the camera preview,
 * scaling detector-space coordinates into view space. Purely
 * presentational canvas painter owned by FaceVerificationScreen.
 * Renders nothing until all dimension props are non-zero.
 */
export const CameraPainter: React.FC<CameraPainterProps> = ({
  faces,
  frameWidth,
  frameHeight,
  viewWidth,
  viewHeight,
  isFrontCamera = true,
}) => {
  if (!frameWidth || !frameHeight || !viewWidth || !viewHeight) return null;

  const scaleX = viewWidth / frameWidth;
  const scaleY = viewHeight / frameHeight;

  return (
    <View className="absolute inset-0" pointerEvents="none">
      {faces.map((face, index) => {
        const { bounds, leftEyeOpenProbability, rightEyeOpenProbability, landmarks } = face;

        // Front camera mirror adjustment
        const x = isFrontCamera ? frameWidth - bounds.x - bounds.width : bounds.x;
        const y = bounds.y;

        // Scaled coordinates
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = bounds.width * scaleX;
        const scaledHeight = bounds.height * scaleY;

        // Eye landmarks
        const leftEye = landmarks?.LEFT_EYE;
        const rightEye = landmarks?.RIGHT_EYE;

        const leftEyeX = leftEye
          ? (isFrontCamera ? frameWidth - leftEye.x : leftEye.x) * scaleX
          : null;
        const leftEyeY = leftEye ? leftEye.y * scaleY : null;

        const rightEyeX = rightEye
          ? (isFrontCamera ? frameWidth - rightEye.x : rightEye.x) * scaleX
          : null;
        const rightEyeY = rightEye ? rightEye.y * scaleY : null;

        // Blink detection logic
        const leftProb = leftEyeOpenProbability ?? 1.0;
        const rightProb = rightEyeOpenProbability ?? 1.0;
        const isBlinking = leftProb < 0.45 && rightProb < 0.45;

        return (
          <React.Fragment key={index}>
            {/* FACE RECTANGLE */}
            <View
              className="absolute rounded-lg border-[3px] border-green-500"
              style={{
                left: scaledX,
                top: scaledY,
                width: scaledWidth,
                height: scaledHeight,
              }}
            />

            {/* STATUS TEXT (BLINK / OPEN) */}
            <Text
              className={`absolute text-base font-bold ${
                isBlinking ? 'text-red-500' : 'text-green-500'
              }`}
              style={{
                left: scaledX,
                top: Math.max(scaledY - 24, 20),
              }}>
              {isBlinking ? 'BLINK' : 'OPEN'}
            </Text>

            {/* LEFT EYE LANDMARK */}
            {leftEyeX !== null && leftEyeY !== null && (
              <View
                className="absolute h-2.5 w-2.5 rounded-full bg-red-500"
                style={{
                  left: leftEyeX - 5,
                  top: leftEyeY - 5,
                }}
              />
            )}

            {/* RIGHT EYE LANDMARK */}
            {rightEyeX !== null && rightEyeY !== null && (
              <View
                className="absolute h-2.5 w-2.5 rounded-full bg-red-500"
                style={{
                  left: rightEyeX - 5,
                  top: rightEyeY - 5,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};
