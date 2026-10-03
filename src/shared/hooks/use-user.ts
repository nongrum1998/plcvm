import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { http } from '@utils/http/client';

export function useUser<T>() {
  const { isSignedIn } = useAuthStore();
  return useQuery({
    queryKey: ['current', 'user'],
    queryFn: () => http.get<T>(ENDPOINTS.AUTH.USER),
    select: (data) => data.data,
    enabled: isSignedIn,
  });
}
