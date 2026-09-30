import { View, Text } from 'react-native';
import { Button } from '../ui';
import { Href, Stack } from 'expo-router';
import { useSafeNavigation } from '@hooks';

/**
 * Props for the {@link Forbidden} screen component.
 */
interface ForbiddenProps {
  /** Overrides the default title shown at the top of the screen. Defaults to 'Access Restricted'. */
  title?: string;
  /** Overrides the default explanatory message shown under the title. Defaults to a permission notice. */
  message?: string;
  /** Custom handler for the "Go Back Home" button. Defaults to replacing the current route with the home page. */
  /** When provided, renders a "Try Again" button that invokes this handler on press. */
  onPressTryAgain?: () => void;
  onLogout?: () => void;
  url?: Href;
}

/**
 * Renders a full-screen "Access Denied" state for routes the user is not
 * permitted to view. Displays a security icon, the failure title and message,
 * and action buttons: "Go Back Home", an optional "Try Again", and "Logout".
 *
 * By default, "Go Back Home" replaces the current route with the home page via
 * the expo-router router, and "Logout" clears the authenticated session through
 * {@link useAuthStore}. Pass `onPressHome` or `onPressTryAgain` to override the
 * respective default behavior; the "Try Again" button is rendered only when
 * `onPressTryAgain` is provided. The screen hides the native header by
 * registering a `Stack.Screen` with `headerShown: false`.
 *
 * @example
 * <Forbidden />
 *
 * @example
 * <Forbidden
 *   title="Workspace Locked"
 *   message="Your workspace has been locked by an administrator."
 *   onPressTryAgain={retryWorkspaceSync}
 * />
 */
export const Forbidden = ({
  title = 'Access Restricted',
  message = 'You do not have permission to view this page. Contact your administrator if you believe this is a mistake.',
  onPressTryAgain,
  onLogout,
  url = '/',
}: ForbiddenProps) => {
  const { navigate } = useSafeNavigation();

  const handlePress = () => {
    navigate(url, 'replace');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 items-center justify-center gap-y-5 p-6">
        <Text className="text-center text-4xl font-bold tracking-widest text-foreground">
          {title}
        </Text>

        <Text className="text-center text-base leading-6 text-muted-foreground">{message}</Text>

        <Button
          onPress={handlePress}
          size={'lg'}
          className="w-full"
          variant={'outline'}
          activeOpacity={0.8}>
          Go Back Home
        </Button>

        {onPressTryAgain && (
          <Button
            variant={'primary'}
            size={'lg'}
            className="w-full"
            onPress={() => onPressTryAgain && onPressTryAgain()}
            activeOpacity={0.7}>
            Try Again
          </Button>
        )}
        {onLogout && (
          <Button
            className="w-full"
            size={'lg'}
            variant={'destructive'}
            onPress={onLogout}
            activeOpacity={0.8}>
            Logout
          </Button>
        )}
      </View>
    </>
  );
};
