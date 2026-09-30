import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';
import { RegistrationStatusInput } from '../validators';
import { useRegistrationStore } from '../store/registration';

type PPOStatus = {
  bank_accno: string;
  dob: string;
  pname: string;
  ppo_no: string;
};

export function useCheckPPO() {
  const { nextStep, setValidationData, saveData } = useRegistrationStore();
  return useMutation({
    mutationFn: (data: RegistrationStatusInput) =>
      http.post<PPOStatus>(ENDPOINTS.USER.REGISTRATION_STATUS, data),
    onSuccess: (data) => {
      if (!data.success) return;
      if (!data.data) return;

      const dob = data.data?.dob;
      const bank_account_no = data.data?.bank_accno;
      const ppo_no = data.data?.ppo_no;

      if (!dob || !bank_account_no) return;

      // Persist the server-returned PPO into both the read-only validation
      // slice and the editable formData so the camera step can submit it.
      // Never use `user?.ppo_no` here — the auth store is not populated
      // before login.
      setValidationData({
        bank_accno: bank_account_no,
        ppo_no,
        dob,
      });
      saveData({ ppo_no });
      nextStep();
      return data;
    },
  });
}
