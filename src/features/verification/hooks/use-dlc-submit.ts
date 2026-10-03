import { useMutation } from '@tanstack/react-query';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import type { ApiResponse } from '@sharedTypes/api/response';
import { useAuthStore } from '@stores/auth.store';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http/client';
import type {
  DlcDeclarationDetails,
  DlcResponseEnvelope,
  DlcSubmitPayload,
} from '@features/verification/types/face-verification';
import { useCurrentLocation } from '@hooks/use-current-location';
import { PermissionStatus } from 'expo-location';

/** Values supplied by the face-verification screen for one DLC submission. */
type DlcSubmitInput = DlcDeclarationDetails & {
  image: string;
};

/** Device metadata attached to every DLC submission. */
interface DeviceMetadata {
  /** Human-readable application name (fallback `'Unknown'`). */
  deviceName: string;
  /** OS-level device identifier (iOS `idForVendor` / Android ID, fallback `'unknown'`). */
  deviceId: string;
}

/**
 * Resolves device metadata for the DLC payload.
 *
 * Must be called from an async context: Hermes does not support top-level
 * `await`, and module-scope awaits crash the JS bundle at compile time
 * ("')' expected at end of parenthesized expression").
 *
 * @returns The application name and platform-specific device identifier.
 */
async function resolveDeviceMetadata(): Promise<DeviceMetadata> {
  const deviceName = Application.applicationName ?? 'Unknown';

  const deviceId =
    Platform.OS === 'ios'
      ? (await Application.getIosIdForVendorAsync()) ?? 'unknown'
      : Application.getAndroidId() ?? 'unknown';

  return { deviceName, deviceId };
}

/**
 * Submits a DLC declaration and captured image to `POST /dlc`.
 *
 * The hook reads PPO identity from the authenticated user, resolves the
 * platform device metadata, and constructs one {@link DlcSubmitPayload}. The
 * plain object is passed to the existing HTTP client so its Fernet interceptor
 * encrypts the request. The captured image is forwarded unchanged and is not
 * logged or persisted by this hook.
 *
 * @returns A TanStack Query mutation that resolves to the shared
 * {@link ApiResponse} envelope with the backend application status normalized
 * into `success`. The mutation rejects when the HTTP exchange fails,
 * authenticated PPO details or device metadata cannot be resolved, or the
 * decrypted response envelope is malformed.
 */
export function useSubmitDLC() {
  const { user } = useAuthStore();
  const { getLocationName, permission, getCurrentLocation } = useCurrentLocation();
  const isLocationPermissionGranted = permission === PermissionStatus.GRANTED;

  return useMutation<ApiResponse<unknown>, Error, DlcSubmitInput>({
    mutationFn: async ({ nec, nmc, image }) => {
      const ppoId = user?.ppo_id;
      const ppoNo = user?.ppo_no;
      let place = 'unknown';

      if (!ppoId || !ppoNo) {
        throw new Error('Authenticated PPO details are required');
      }

      const currentPosition = await getCurrentLocation();

      const coords = currentPosition?.coords;

      if (coords.latitude && coords.longitude && isLocationPermissionGranted) {
        const locationName = await getLocationName({
          latitude: currentPosition?.coords.latitude || 0,
          longitude: currentPosition?.coords.longitude || 0,
        });

        place = locationName
          ? `${locationName?.city}-${locationName?.district}-${locationName?.region}`
          : 'unknown';
      }

      const { deviceName, deviceId } = await resolveDeviceMetadata();

      const requestBody: DlcSubmitPayload = {
        deviceName,
        deviceId,
        ppo_id: ppoId,
        ppo_no: ppoNo,
        nec,
        nmc,
        place: place,
        image,
      };

      const response = await http.post<DlcResponseEnvelope>(ENDPOINTS.DLC.CREATE, requestBody);

      return {
        success: response.success,
        message: response.message,
      };
    },
  });
}
