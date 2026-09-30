import { create } from 'zustand';
import { RegisterInput } from '../validators';

const defaultValue: Omit<RegisterInput, 'confirm_password'> = {
  dob: '',
  password: '',
  bank_accno: '',
  ppo_no: '',
};

interface RegistrationStore {
  step: number;
  formData: Omit<RegisterInput, 'confirm_password'>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveData: (data: Partial<RegisterInput>) => void;
  reset: () => void;

  validation: Omit<RegisterInput, 'confirm_password' | 'password'> | null;
  setValidationData: (data: Omit<RegisterInput, 'confirm_password' | 'password'>) => void;
}

export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  step: 1,
  formData: defaultValue,
  validation: null,
  setValidationData: (data) => set({ validation: data }),

  setStep: (step) => set({ step }),
  nextStep: () => {
    // Wizard: 1 = PPO check, 2 = details, 3 = camera capture & submit.
    if (get().step < 3) {
      set((state) => ({ step: state.step + 1 }));
    }
  },
  prevStep: () => {
    if (get().step > 1) {
      set((state) => ({ step: state.step - 1 }));
    }
  },

  saveData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  reset: () => set({ step: 1, formData: defaultValue, validation: null }),
}));
