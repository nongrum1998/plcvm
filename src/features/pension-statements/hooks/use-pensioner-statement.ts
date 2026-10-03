import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { http } from '@utils/http/client';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { decryptText } from '@lib/encryption/encryption';
import { PensionStatementResponseI, PensionerStatement } from '../types/pensioner-statement';
import { logger } from '@utils/logger/logger';

export function usePensionerStatement() {
  const { user, isSignedIn } = useAuthStore();
  const ppoNo = user?.ppo_no;
  const isEnabled = !!ppoNo && isSignedIn;

  return useQuery({
    queryKey: ['pensioner', 'statement', ppoNo],
    queryFn: () =>
      http.post<PensionStatementResponseI>(ENDPOINTS.PENSIONER_STATEMENTS.PAYMENT_SLIP, {
        ppo_no: ppoNo,
      }),
    enabled: isEnabled,
    select: (res) => {
      if (!res) return res;
      const data = res.data;

      // Note: If your Axios response interceptor already decrypts the entire payload,
      // you can simply return `data` without any manual decryption here.

      let decryptedPension: PensionerStatement[] = [];
      let decryptedPdf: string = '';

      try {
        decryptedPension =
          typeof data?.pension === 'string' ? JSON.parse(decryptText(data.pension)) : data?.pension;
      } catch (e) {
        logger.log('Failed to parse decrypted pension statement:', e);
      }

      try {
        decryptedPdf =
          typeof data?.pdf === 'string' ? (decryptText(data.pdf) as string) : data?.pdf || '';
      } catch (e) {
        logger.log('Failed to decrypt PDF URI:', e);
      }

      return {
        ...data,
        pension: decryptedPension,
        pdf: decryptedPdf,
      };
    },
  });
}
