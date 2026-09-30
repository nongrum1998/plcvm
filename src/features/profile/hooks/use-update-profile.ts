import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';
import { useAuthStore } from '@stores/auth.store';
import { ProfileUpdateInput } from '../validators';

/**
 * Mutation to update the signed-in user's profile.
 *
 * Accepts the API payload type {@link ProfileUpdateInput}, which is the same type
 * inferred from `ProfileUpdateSchema` and used by the profile-update form.
 *
 * IMPORTANT: `http.post` never rejects — it resolves with an `ApiResponse` even on
 * HTTP errors (e.g. a 404 when the endpoint is not yet implemented). We therefore
 * `throw` when `res.success` is false so react-query correctly sets `isError` and
 * does NOT fire `onSuccess`; this prevents the local auth store from being updated
 * (and the UI showing "Profile Updated") on a server failure.
 *
 * On a genuine success we merge the submitted values into the local auth store via
 * `setUser` so the Profile screen reflects the change immediately, even before the
 * backend returns the full updated user record.
 */
export function useUpdateProfile() {
  const { refresh } = useAuthStore();
  return useMutation({
    mutationFn: async (data: ProfileUpdateInput) => http.post(ENDPOINTS.USER.UPDATE_PROFILE, data),
    onSuccess: (res) => {
      if (!res.success) return;
      refresh();
    },
  });
}
