import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { Text, View } from 'react-native';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FooterImg } from '@components/common/nic-footer-img';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { PAGE_ROUTES } from '@utils/constants/routes';
import * as Linking from 'expo-linking';
import { APP_LINKS } from '@utils/constants/app-link';
import { Container } from '@components/layout/container';
/**
 * Registration guide screen shown before the wizard.
 *
 * Senior-friendly: >=16px body text everywhere (critical support info
 * included), large numbered step badges, big tappable email/phone chips,
 * theme-token colors for dark mode, and one obvious primary action.
 *
 * @returns The rendered registration instruction screen.
 */
export function RegistrationInstructionScreen() {
  const { navigate } = useSafeNavigation();

  const handleEmailSupport = async () => {
    const url = `mailto:${APP_LINKS.EMAIL.DAT_SHIL_MEG}`;

    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      return;
    }

    await Linking.openURL(url);
  };

  const handlePhoneSupport = async () => {
    const url = `tel:${APP_LINKS.PHONE.LAND_LINE}`;

    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-background">
      <Container className="gap-5">
        {/* Header Section */}

        <View className="gap-2">
          <View className="bg-primary/10 self-start py-1">
            <Text className="text-sm font-bold uppercase tracking-wider text-primary">Guide</Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            Registration Guide
          </Text>
          <Text className="text-sm font-medium text-muted-foreground">
            Follow the steps below to register or update your password
          </Text>
        </View>

        {/* STEP 1 CARD */}
        <View className="gap-3 rounded-md border border-border bg-card p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full">
              <Text className="text-lg font-bold text-primary">1</Text>
            </View>
            <Text className="flex-1 text-base font-semibold text-foreground">
              Verify PPO Status
            </Text>
          </View>

          <Text className="text-base leading-relaxed text-muted-foreground">
            Enter your <Text className="font-semibold text-foreground">PPO Number</Text> and tap{' '}
            <Text className="font-semibold text-foreground">Check PPO Status</Text>.
          </Text>

          {/* Invalid PPO Alert Box */}
          <View className="mt-1 gap-2 rounded-md border border-amber-200/60 p-3.5">
            <Alert variant="warning">
              <Icon name="alert-triangle" size={18} className="mt-0.5 text-amber-600" />
              <View className="flex-1">
                <AlertTitle>If your PPO No. is showing as Invalid:</AlertTitle>
                <AlertDescription>
                  Please reach out to support or visit your nearest Treasury Office.
                </AlertDescription>
              </View>
            </Alert>

            <View className="mt-1 flex-1 flex-row items-center gap-2">
              <Button
                onPress={handleEmailSupport}
                className="flex-1 bg-amber-100/80 px-4 py-2.5 active:opacity-70"
                size={'lg'}
                accessibilityLabel="Email support at dat shil meg at nic dot in">
                <Text className="text-base font-semibold text-amber-900">dat-shil-meg@nic.in</Text>
              </Button>

              <Button
                onPress={handlePhoneSupport}
                className="flex-1 bg-amber-100/80 px-4 py-2.5 active:opacity-70"
                size={'lg'}
                accessibilityLabel="Call support at 0364 222 6553">
                <Text className="text-base font-semibold text-amber-900">0364-2226553</Text>
              </Button>
            </View>
          </View>
        </View>

        {/* STEP 2 CARD */}
        <View className="gap-4 rounded-md border border-border bg-card p-4">
          <View className="flex-row items-center gap-3">
            <View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-full">
              <Text className="text-lg font-bold text-primary">2</Text>
            </View>
            <Text className="flex-1 text-base font-semibold text-foreground">
              Provide Verification Details
            </Text>
          </View>

          {/* Item A */}
          <View className="gap-1.5">
            <Text className="text-base font-medium text-foreground">1. Date of Birth (DOB)</Text>
            <Alert variant="default">
              <Icon name="info" size={18} className="mt-0.5 text-gray-700" />
              <View className="flex-1">
                <AlertTitle>Family Pensioners:</AlertTitle>
                <AlertDescription>
                  Do not enter your own DOB. Enter the DOB of the deceased primary pensioner from
                  whom pension is received.
                </AlertDescription>
              </View>
            </Alert>
          </View>

          {/* Item B */}
          <View className="gap-1">
            <Text className="text-base font-medium text-foreground">2. Bank Account Number</Text>
            <Text className="pl-4 text-base leading-relaxed text-muted-foreground">
              Enter the bank account where your pension is currently credited.
            </Text>
          </View>

          {/* Item C */}
          <View className="gap-1">
            <Text className="text-base font-medium text-foreground">3. Set Password</Text>
            <Text className="pl-4 text-base leading-relaxed text-muted-foreground">
              Create a secure password for logging into your account.
            </Text>
            <Text className="pl-4 text-base leading-relaxed text-muted-foreground">
              Confirm your password for additional security.
            </Text>
          </View>
        </View>

        {/* Important Notice Callout */}
        <Alert variant="destructive">
          <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />
          <View className="flex-1">
            <AlertTitle className="text-sm">Important</AlertTitle>
            <AlertDescription>
              Please make sure all information provided matches your official treasury records
              before proceeding.
            </AlertDescription>
          </View>
        </Alert>

        {/* User Manual Section */}
        <View className="gap-3 rounded-md border border-border bg-card p-4">
          <View className="flex-row items-center gap-3">
            <View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-full">
              <Icon name="book-01" size={18} className="text-primary" />
            </View>
            <Text className="flex-1 text-base font-semibold text-foreground">User Manual</Text>
          </View>

          <Text className="text-base leading-relaxed text-muted-foreground">
            Need help? Check the <Text className="font-semibold text-foreground">User Manual</Text>{' '}
            for step-by-step instructions on using the pensioner portal.
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

        {/* Action Button */}
        <Button size="lg" onPress={() => navigate(PAGE_ROUTES.AUTH.REGISTER)}>
          Proceed to Registration
        </Button>

        {/* Footer Branding */}
        <FooterImg />
      </Container>
    </SafeAreaView>
  );
}
