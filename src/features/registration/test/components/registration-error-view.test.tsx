import { fireEvent, render, screen } from '@testing-library/react-native';
import { RegistrationErrorView } from '@features/registration/components/registration-error-view';
import { useRegistrationStore } from '@features/registration/store';
import { PAGE_ROUTES } from '@utils/constants';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@hooks', () => ({
  useSafeNavigation: () => ({ navigate: mockNavigate, back: jest.fn() }),
}));

describe('RegistrationErrorView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useRegistrationStore.getState().reset();
  });

  it('renders the failure message and retry action', async () => {
    await render(<RegistrationErrorView />);

    expect(screen.getByText('Registration Failed')).toBeTruthy();
    expect(screen.getByText('Please try again')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('renders a custom message when one is provided', async () => {
    await render(<RegistrationErrorView message="Network connection lost" />);

    expect(screen.getByText('Registration Failed')).toBeTruthy();
    expect(screen.getByText('Network connection lost')).toBeTruthy();
  });

  it('resets the wizard and navigates to register when Try again is pressed', async () => {
    useRegistrationStore.getState().setStep(3);

    await render(<RegistrationErrorView />);
    await fireEvent.press(screen.getByText('Try again'));

    expect(mockNavigate).toHaveBeenCalledWith(PAGE_ROUTES.AUTH.REGISTER, 'replace');

    const state = useRegistrationStore.getState();
    expect(state.step).toBe(1);
    expect(state.formData).toEqual({ ppo_no: '', dob: '', password: '', bank_accno: '' });
  });
});
