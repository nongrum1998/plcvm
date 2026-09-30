import { act } from '@testing-library/react-native';
import { useRegistrationStore } from '@features/registration/store';

describe('useRegistrationStore', () => {
  beforeEach(() => {
    act(() => {
      useRegistrationStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('starts at step 1', () => {
      expect(useRegistrationStore.getState().step).toBe(1);
    });

    it('starts with empty form data (bank_accno, no confirm_password)', () => {
      expect(useRegistrationStore.getState().formData).toEqual({
        ppo_no: '',
        dob: '',
        password: '',
        bank_accno: '',
      });
    });

    it('starts without validation data', () => {
      expect(useRegistrationStore.getState().validation).toBeNull();
    });
  });

  describe('step navigation (3-step wizard)', () => {
    it('sets the step', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
      });

      expect(useRegistrationStore.getState().step).toBe(3);
    });

    it('moves to the next step', () => {
      act(() => {
        useRegistrationStore.getState().nextStep();
      });

      expect(useRegistrationStore.getState().step).toBe(2);
    });

    it('does not go beyond step 3', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
        useRegistrationStore.getState().nextStep();
      });

      expect(useRegistrationStore.getState().step).toBe(3);
    });

    it('moves to the previous step', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
        useRegistrationStore.getState().prevStep();
      });

      expect(useRegistrationStore.getState().step).toBe(2);
    });

    it('does not go below step 1', () => {
      act(() => {
        useRegistrationStore.getState().prevStep();
      });

      expect(useRegistrationStore.getState().step).toBe(1);
    });
  });

  describe('form data', () => {
    it('saves partial form data', () => {
      act(() => {
        useRegistrationStore.getState().saveData({
          ppo_no: 'PPO123',
          dob: '01/01/1990',
        });
      });

      expect(useRegistrationStore.getState().formData).toEqual({
        ppo_no: 'PPO123',
        dob: '01/01/1990',
        password: '',
        bank_accno: '',
      });
    });

    it('merges new data with existing form data', () => {
      act(() => {
        useRegistrationStore.getState().saveData({ ppo_no: 'PPO123' });
        useRegistrationStore.getState().saveData({ password: 'secret' });
      });

      expect(useRegistrationStore.getState().formData).toEqual({
        ppo_no: 'PPO123',
        dob: '',
        password: 'secret',
        bank_accno: '',
      });
    });
  });

  describe('validation', () => {
    it('sets validation data (no password or confirm_password)', () => {
      const validationData = {
        dob: '01/01/1990',
        bank_accno: '123456789',
      };

      act(() => {
        useRegistrationStore.getState().setValidationData(validationData);
      });

      expect(useRegistrationStore.getState().validation).toEqual(validationData);
    });
  });

  describe('reset', () => {
    it('resets step, form data, and validation', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
        useRegistrationStore.getState().saveData({ ppo_no: 'PPO123', password: 'secret' });
        useRegistrationStore.getState().setValidationData({
          dob: '01/01/1990',
          bank_accno: '123456789',
        });
      });

      act(() => {
        useRegistrationStore.getState().reset();
      });

      expect(useRegistrationStore.getState()).toMatchObject({
        step: 1,
        formData: { ppo_no: '', dob: '', password: '', bank_accno: '' },
        validation: null,
      });
    });
  });
});
