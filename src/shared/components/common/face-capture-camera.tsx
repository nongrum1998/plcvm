import { type ComponentProps } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Camera, type CameraDevice } from 'react-native-vision-camera';
import type { Face } from 'react-native-vision-camera-face-detector';
import { CameraPainter } from '@components/common/camera-painter';
import { Button } from '../ui';

/** Outputs prop shape of the vision-camera `Camera` component. */
type CameraOutputs = ComponentProps<typeof Camera>['outputs'];

/** Props for {@link FaceCaptureCamera}. */
export interface FaceCaptureCameraProps {
  /** Called when the user taps the camera overlay's reset action. */
  onReset: () => void;
  /** Active camera device (front camera for liveness capture). */
  device: CameraDevice;
  /** Detector + photo outputs from `useFaceCapture().outputs`. */
  outputs: CameraOutputs;
  /** Latest detected faces from `useFaceCapture().faces`. */
  faces: Face[];
  /** Detector-frame dimensions (for painter scaling). */
  frameWidth: number;
  frameHeight: number;
  /** Layout/view dimensions (for painter scaling). */
  viewWidth: number;
  viewHeight: number;
  /** Liveness instruction shown in the bottom banner
   *  (from `useFaceCapture().message`). */
  message: string;
}

/**
 * Full-screen front-camera surface for blink liveness capture.
 *
 * Renders the active camera preview, overlays detected-face boxes scaled
 * from detector space to view space via {@link CameraPainter}, and shows
 * the current liveness instruction in a translucent bottom banner. Purely
 * presentational: detection state, the outputs, and the banner message all
 * flow in as props from {@link useFaceCapture}, so this component has no
 * store dependency and can be shared by face verification and registration.
 *
 * @param props - {@link FaceCaptureCameraProps}.
 */
export function FaceCaptureCamera({
  device,
  outputs,
  faces,
  frameWidth,
  frameHeight,
  viewWidth,
  viewHeight,
  message,
  onReset,
}: FaceCaptureCameraProps) {
  return (
    <>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} outputs={outputs} />
      <CameraPainter
        faces={faces}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        viewWidth={viewWidth}
        viewHeight={viewHeight}
        isFrontCamera={true}
      />
      {/* Bottom overlay message */}
      <View className="absolute left-5 right-5 top-5 flex-row items-center rounded-xl bg-black/75 p-4">
        <View className="flex-1">
          <Text className="text-center text-lg font-bold text-white">{message}</Text>
        </View>
        <View>
          <Button variant={'secondary'} size={'default'} onPress={onReset}>
            Cancel
          </Button>
        </View>
      </View>

      <View className="absolute bottom-0 left-5 right-5 rounded-xl p-4"></View>
    </>
  );
}
