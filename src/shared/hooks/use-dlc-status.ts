import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { http } from '@utils/http/client';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { VerificationStatusT } from '@features/verification/types/verification-status';

export function useDlcStatus() {
  const { user, isSignedIn } = useAuthStore();

  const ppo_id = user?.ppo_id;

  const isEnabled = isSignedIn && !!ppo_id;
  return useQuery({
    queryKey: ['verificationStatus', ppo_id],
    queryFn: () => http.post<VerificationStatusT>(ENDPOINTS.DLC.STATUS, { ppo_id: ppo_id }),
    select: (d) => d.data,
    enabled: isEnabled,
  });
}
