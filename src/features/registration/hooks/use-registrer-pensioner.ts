import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http/client';
import { sha256 } from '@lib/encryption/encryption';
import { RegisterPensionerInput } from '../validators/registration';

/**
 * Response payload of `POST {USER.CREATE_PENSIONER}` — callers currently
 * only consume the envelope's `success` and `message` fields.
 */

interface RegisterPensionerData {
  ppo_no?: string | null;
}

/**
 * Registers a pensioner after the PPO check, details entry, and face capture.
 *
 * Sends the raw password through {@link formatPassword} (which internally
 * SHA-256 hashes, salts, and base64-encodes — do NOT hash again) together
 * with the PPO number, date of birth, bank account number, and the captured
 * face photo as base64. The body is `application/x-www-form-urlencoded`
 * (mirroring the face-verification submit flow) so the request interceptor
 * passes it through unchanged instead of Fernet-wrapping it. In `__DEV__`
 * the configured `EXPO_PUBLIC_TEST_IMAGE` replaces the captured image.
 *
 * @returns TanStack Query mutation returning the standard API envelope
 * `{ success, message, data? }`.
 */
export function useRegisterPensioner() {
  return useMutation({
    mutationFn: (data: RegisterPensionerInput) => {
      const payload = {
        ppo_no: data.ppo_no,
        dob: data.dob,
        bank_accno: data.bank_accno,
        password: sha256(data.password),
        image: data.image,
      };
      return http.post<RegisterPensionerData>(ENDPOINTS.USER.CREATE_PENSIONER, payload, {
        timeout: 60_000,
      });
    },
  });
}
