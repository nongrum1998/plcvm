import '@styles/index.css';
import { Stack } from 'expo-router';
import { ProviderWrapper } from '@components/providers/provider-wrapper';
import { SnackbarProvider } from '@components/ui/snackbar-provider';
import * as SplashScreen from 'expo-splash-screen';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  return (
    <ProviderWrapper>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      <SnackbarProvider />
    </ProviderWrapper>
  );
}
