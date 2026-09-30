import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileUpdateScreen } from '@features/profile/screens/profile-update-screen';
import { useAuthStore } from '@stores/auth.store';
import type { UserT } from '@sharedTypes/auth';

const mockMutate = jest.fn();

jest.mock('@features/profile/hooks/use-update-profile', () => ({
  useUpdateProfile: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
}));

/** `SelectSheet` reads insets from the safe-area context, which has no provider under Jest. */
const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Renders the screen inside the safe-area provider the app provides at the root. */
const renderScreen = async () => {
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ProfileUpdateScreen />
    </SafeAreaProvider>
  );
};

const buildUser = (overrides: Partial<UserT> = {}): UserT =>
  ({
    pname: 'Ram Kumar',
    ppo_no: '1234567',
    dob: '25/08/1990',
    gender: 'M',
    pclass: 'Class I',
    treasury_name: 'Chennai',
    ...overrides,
  }) as UserT;

/**
 * Puts a user into the auth store so the screen's `defaultValues` pick it up.
 * The screen reads `user` during the first render, so the state must be set
 * before `render` is called.
 */
const signInAs = (user: UserT | null) => {
  useAuthStore.setState({ user, isSignedIn: !!user });
};

describe('ProfileUpdateScreen', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    useAuthStore.setState({ user: null, isSignedIn: false });
  });

  it('renders a label for each of the six fields in the update contract', async () => {
    await renderScreen();

    expect(screen.getByText('Date of Birth')).toBeTruthy();
    expect(screen.getByText('PAN Number')).toBeTruthy();
    expect(screen.getByText('Mobile Number')).toBeTruthy();
    expect(screen.getByText('Height (cm)')).toBeTruthy();
    expect(screen.getByText('Community')).toBeTruthy();
    expect(screen.getByText('Marital Status')).toBeTruthy();
  });

  it('no longer renders the fields that were dropped from the schema', async () => {
    await renderScreen();

    expect(screen.queryByText('Name')).toBeNull();
    expect(screen.queryByText('Organization')).toBeNull();
    expect(screen.queryByText('Username')).toBeNull();
  });

  it('prefills the date of birth from the signed-in user', async () => {
    signInAs(buildUser({ dob: '25/08/1990' }));

    await renderScreen();

    expect(screen.getByDisplayValue('25/08/1990')).toBeTruthy();
  });

  it('leaves the date of birth empty when no user is signed in', async () => {
    await renderScreen();

    expect(screen.getByPlaceholderText('DD/MM/YYYY').props.value).toBe('');
  });

  it('starts the five fields with no data source empty', async () => {
    signInAs(buildUser());

    await renderScreen();

    expect(screen.getByPlaceholderText('ABCDE1234F').props.value).toBe('');
    expect(screen.getByPlaceholderText('Enter 10-digit mobile number').props.value).toBe('');
    expect(screen.getByPlaceholderText('Enter height in centimetres').props.value).toBe('');
  });

  it('shows the submit action', async () => {
    await renderScreen();

    expect(screen.getByText('Save Changes')).toBeTruthy();
  });

  // The mask and character filters keep the form from ever holding a value the
  // schema would reject for a character reason.
  describe('input masking', () => {
    it.each([
      ['2', '2'],
      ['25', '25'],
      ['250', '25/0'],
      ['2508', '25/08'],
      ['25081990', '25/08/1990'],
    ])('masks the typed date %s as %s', async (typed, expected) => {
      await renderScreen();

      const input = screen.getByPlaceholderText('DD/MM/YYYY');
      await fireEvent.changeText(input, typed);

      expect(input.props.value).toBe(expected);
    });

    it('ignores a ninth digit so the date cannot exceed DD/MM/YYYY', async () => {
      await renderScreen();

      const input = screen.getByPlaceholderText('DD/MM/YYYY');
      await fireEvent.changeText(input, '250819901');

      expect(input.props.value).toBe('25/08/1990');
    });

    it('drops non-digits from the date, since some IMEs emit symbols', async () => {
      await renderScreen();

      const input = screen.getByPlaceholderText('DD/MM/YYYY');
      await fireEvent.changeText(input, '25-08-1990');

      expect(input.props.value).toBe('25/08/1990');
    });

    it('drops non-digits from the mobile number and caps it at ten', async () => {
      await renderScreen();

      const input = screen.getByPlaceholderText('Enter 10-digit mobile number');
      // 13 digits survive the filter, so the tenth-character cap must engage.
      await fireEvent.changeText(input, '98a76b43210999');

      expect(input.props.value).toBe('9876432109');
    });

    it('drops non-alphanumerics from the PAN number and caps it at ten', async () => {
      await renderScreen();

      const input = screen.getByPlaceholderText('ABCDE1234F');
      await fireEvent.changeText(input, 'AB!CDE1234F9');

      expect(input.props.value).toBe('ABCDE1234F');
    });

    it('uppercases a pasted PAN, which autoCapitalize does not cover', async () => {
      await renderScreen();

      const input = screen.getByPlaceholderText('ABCDE1234F');
      await fireEvent.changeText(input, 'abcde1234f');

      expect(input.props.value).toBe('ABCDE1234F');
    });

    it('keeps only one decimal point in the height', async () => {
      await renderScreen();

      const input = screen.getByPlaceholderText('Enter height in centimetres');
      await fireEvent.changeText(input, '170.5.2cm');

      expect(input.props.value).toBe('170.5');
    });
  });

  describe('validation', () => {
    it('does not submit an empty form', async () => {
      await renderScreen();

      await fireEvent.press(screen.getByText('Save Changes'));

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('reports a required error for each field left empty', async () => {
      await renderScreen();

      await fireEvent.press(screen.getByText('Save Changes'));

      expect(await screen.findByText('Date of birth is required')).toBeTruthy();
      expect(screen.getByText('PAN number is required')).toBeTruthy();
      expect(screen.getByText('Mobile number is required')).toBeTruthy();
      expect(screen.getByText('Community is required')).toBeTruthy();
      expect(screen.getByText('Marital status is required')).toBeTruthy();
    });

    it('accepts a date with a day above 12, which Date.parse would have rejected', async () => {
      await renderScreen();

      await fireEvent.changeText(screen.getByPlaceholderText('DD/MM/YYYY'), '25/08/1990');
      await fireEvent.changeText(screen.getByPlaceholderText('ABCDE1234F'), 'ABCDE1234F');
      await fireEvent.changeText(
        screen.getByPlaceholderText('Enter 10-digit mobile number'),
        '9876543210'
      );
      await fireEvent.changeText(screen.getByPlaceholderText('Enter height in centimetres'), '170');
      await fireEvent.press(screen.getByText('Save Changes'));

      expect(screen.queryByText('Please enter a valid date of birth')).toBeNull();
    });
  });
});
