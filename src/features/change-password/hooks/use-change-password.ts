import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http/client';
import { ChangePasswordInput } from '../validators/change-password';
import { sha256 } from '@lib/encryption/encryption';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: Omit<ChangePasswordInput, 'confirmPassword'>) =>
      http.post(ENDPOINTS.USER.CHANGE_PASSWORD, {
        oldPassword: sha256(data.oldPassword),
        newPassword: sha256(data.newPassword),
      }),
    onSuccess: (data) => console.log('useChange password', data),
  });
}
