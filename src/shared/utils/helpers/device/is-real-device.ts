import * as Device from 'expo-device';

/**
 * Checks whether the current runtime is an Expo (native) environment.
 *
 * Uses `expo-device` to determine if the code is running on a physical
 * device or emulator, indicating an Expo Go or development build context.
 *
 * @returns `true` if running in an Expo-compatible native environment.
 */
export function isRealDevice(): boolean {
  return Device.isDevice;
}
