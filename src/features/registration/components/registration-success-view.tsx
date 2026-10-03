import { Text, View } from 'react-native';
import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { Button } from '@components/ui/button';
import { useRegistrationStore } from '../store/registration';
import { PAGE_ROUTES } from '@utils/constants/routes';

/**
 * Full-screen success state shown after a successful registration submit.
 *
 * Replaces the entire Step 4 content (header, form, footer). Renders an
 * emerald confirmation card and a "Go to Login" button that resets the
 * registration wizard before navigating to the login route.
 *
 * @returns The rendered success view.
 */
type RegistrationSuccessViewProps = {
  message: string;
};

export function RegistrationSuccessView({ message }: RegistrationSuccessViewProps) {
  const reset = useRegistrationStore((state) => state.reset);
  const { navigate } = useSafeNavigation();

  const handleDone = () => {
    reset();
    navigate(PAGE_ROUTES.AUTH.HOME);
  };

  return (
    <View className="w-full flex-1 flex-row gap-y-5">
      <View className="gap-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
            <Text className="text-lg font-black text-white">✓</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-emerald-900">Registration Successful</Text>
            <Text className="text-sm font-semibold text-emerald-700">
              Your account has been created
            </Text>
          </View>
        </View>

        <View className="h-[1px] w-full bg-emerald-500/20" />

        <Text className="text-center text-lg font-medium leading-relaxed text-emerald-950/80">
          {message}
        </Text>
        <Button size="lg" onPress={handleDone} className="w-full">
          Go to Login
        </Button>
      </View>
    </View>
  );
}
