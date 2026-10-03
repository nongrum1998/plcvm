import { Button } from '@components/ui/button';
import { useRegistrationStore } from '../store/registration';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { Text, View } from 'react-native';
import { useSafeNavigation } from '@hooks/use-safe-navigation';

/**
 * Full-screen success state shown after a successful registration submit.
 *
 * Replaces the entire Step 4 content (header, form, footer). Renders an
 * emerald confirmation card and a "Go to Login" button that resets the
 * registration wizard before navigating to the login route.
 *
 * @returns The rendered success view.
 */
type RegistrationErrorViewProps = {
  message?: string;
};
export function RegistrationErrorView({
  message = 'Please try again',
}: RegistrationErrorViewProps) {
  const reset = useRegistrationStore((state) => state.reset);
  const { navigate } = useSafeNavigation();

  const handleDone = () => {
    reset();
    navigate(PAGE_ROUTES.AUTH.REGISTER, 'replace');
  };

  return (
    <View className="w-full flex-1 flex-row gap-y-5">
      <View className="gap-5 rounded-md border border-red-500/30 bg-red-500/10 p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-red-500">
            <Text className="text-lg font-black text-white">x</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-red-900">Registration Failed</Text>
            <Text className="text-sm font-semibold text-red-700">
              Face verification was unable to complete
            </Text>
          </View>
        </View>

        <View className="h-[1px] w-full bg-red-500/20" />

        <Text className="text-center text-lg font-medium leading-relaxed text-emerald-950/80">
          {message}
        </Text>
        <Button variant={'destructive'} size="lg" onPress={handleDone} className="w-full">
          Try again
        </Button>
      </View>
    </View>
  );
}
