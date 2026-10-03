import { View, Text, Image } from 'react-native';
import { useSafeNavigation } from '@hooks/use-safe-navigation';

import { LoginForm } from '../components/login-form';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { NetworkStatusBanner } from '@components/common/network-status-banner';
import { Container } from '@components/layout/container';
import { FooterImg } from '@components/common/nic-footer-img';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Login screen for the Pensioner Portal.
 *
 * Senior-friendly layout: large-print branding hierarchy, a prominent
 * full-width outline button as the registration entry point (56px tall),
 * and >=16px secondary links with generous touch padding. Theme tokens
 * keep every text tier legible in dark mode.
 *
 * @returns The rendered login screen.
 */
export function LoginScreen() {
  const { navigate } = useSafeNavigation();
  return (
    <SafeAreaView className="flex-1">
      <NetworkStatusBanner />
      <Container centered scrollable dismissKeyboard>
        <View className="w-full items-center gap-6 py-2">
          {/* Top Branding Section */}
          <View className="items-center">
            <Image
              source={require('../../../shared/assets/images/logo.jpg')}
              className="h-24 w-24"
              resizeMode="contain"
            />

            <View className="mt-3 items-center gap-1">
              <Text className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Government of Meghalaya
              </Text>
              <Text className="text-base font-semibold text-foreground">Finance Department</Text>
              <Text className="mt-1 text-2xl font-extrabold text-primary">Pensioner Portal</Text>
            </View>
          </View>

          {/* Main Login Form */}
          <View className="w-full">
            <LoginForm />
          </View>

          {/* Registration & Support Actions */}
          <View className="w-full items-center gap-5">
            {/* Primary entry point for new users — full-width, 56px target */}
            <Button
              variant="outline"
              onPress={() => navigate(PAGE_ROUTES.AUTH.REG_INSTRUCTION)}
              size={'lg'}
              className="w-full">
              <Text className="text-center text-base font-bold text-primary">
                New User? Register / Forgot Password
              </Text>
            </Button>

            {/* Secondary Policy & Manual Links */}
            <View className="gap-3 rounded-md border border-border bg-card p-4">
              <View className="flex-row items-center gap-3">
                <View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-full">
                  <Icon name="book-01" size={18} className="text-primary" />
                </View>
                <Text className="flex-1 text-base font-semibold text-foreground">User Manual</Text>
              </View>

              <Text className="text-center text-base leading-relaxed text-muted-foreground">
                Need help? Check the{' '}
                <Text className="font-semibold text-foreground">User Manual</Text> for step-by-step
                instructions on using the pensioner portal.
              </Text>

              <Button
                variant="outline"
                size="lg"
                onPress={() => navigate(PAGE_ROUTES.USER_MANUAL.HOME)}
                className="flex-row items-center gap-2"
                accessibilityLabel="Open user manual">
                <Icon name="book-01" size={18} className="text-primary" />
                <Text className="text-base font-semibold text-primary">View Manual</Text>
              </Button>
            </View>
          </View>

          {/* Partner Logos & Version Footer */}
          <View className="items-center gap-3 pt-2">
            <FooterImg />
          </View>
        </View>
      </Container>
    </SafeAreaView>
  );
}
