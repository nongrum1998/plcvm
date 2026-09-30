import { LoginT } from '@sharedTypes/auth';
import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http';
import { LoginInput } from '../validators';
import { useAuthStore } from '@stores/auth.store';

export function useLogin() {
  const { refresh } = useAuthStore();
  return useMutation({
    mutationFn: async (data: LoginInput) => http.post<LoginT>(ENDPOINTS.AUTH.LOGIN, data),
    onSuccess: (s) => {
      if (s.success) {
        refresh();
      }
    },
  });
}
