import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { Text, View } from 'react-native';
import { Button } from '../ui/button';

type NotFoundScreenProps = {
  title?: string;
  message?: string;
};

export const NotFoundScreen = ({
  title = '404 - Page Not Found',
  message = 'The page you are trying to access does not exist. Please try again.',
}: NotFoundScreenProps) => {
  const { navigate, back } = useSafeNavigation();
  return (
    <View className="flex-1 flex-col items-center justify-center gap-4 bg-white p-6">
      <Text className="text-4xl font-bold text-destructive">404</Text>

      <Text className="text-2xl font-bold text-destructive">{title}</Text>

      <Text className="text-graphite text-center">{message}</Text>

      <View className="mt-4 w-full items-center justify-center gap-3">
        <Button className="w-full" variant={'outline'} size={'lg'} onPress={() => back()}>
          Go Back
        </Button>
        <Button size={'lg'} className="w-full" onPress={() => navigate('/', 'replace')}>
          Home
        </Button>
      </View>
    </View>
  );
};
