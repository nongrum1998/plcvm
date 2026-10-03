import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container } from '@components/layout/container';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { APP_LINKS } from '@utils/constants/app-link';
import { APP_VERSION } from '@utils/constants/common';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { openPhoneNumber } from '@utils/helpers/linking/app-linking';

import { FooterImg } from '@components/common/nic-footer-img';
import { useSafeNavigation } from '@hooks/use-safe-navigation';

/**
 * Senior-friendly user manual screen for the Pensioner app.
 *
 * Shows a shared header (title, emergency helpline and privacy-policy link)
 * above a two-tab segmented control. The "Getting Started" tab covers setup
 * and registration, while the "Using the App" tab covers daily usage. Each
 * tab's content scrolls independently; the helpline buttons dial numbers via
 * {@link openPhoneNumber}, and the section components open the Play Store and
 * email links.
 *
 * @returns The rendered user manual screen.
 */
export function UserManualScreen() {
  const { navigate } = useSafeNavigation();
  return (
    <SafeAreaView edges={['right', 'left']} className="flex-1">
      <Container className="gap-5">
        <View className="gap-2 pt-2">
          <View className="bg-primary/10 self-start py-1">
            <Text className="text-sm font-bold uppercase tracking-wider text-primary">
              Government of Meghalaya • Finance Department
            </Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            Pensioner App User Guide
          </Text>

          <Text className="text-sm font-medium text-muted-foreground">
            Easy Step-by-Step Instructions {APP_VERSION}
          </Text>
        </View>

        {/* Main Title Hero Card */}

        <View className="gap-4 rounded-md border border-blue-600 bg-blue-50 p-4 ">
          {/* Emergency Helpline Box */}
          <View className="mt-2 w-full gap-3 rounded-md border border-blue-300 bg-white p-5 ">
            <Text className="text-center text-sm font-black uppercase tracking-wider text-slate-800">
              📞 Need help? Tap a number to call us directly:
            </Text>
            <View className="gap-3">
              <Button
                size="lg"
                activeOpacity={0.8}
                onPress={() => openPhoneNumber(APP_LINKS.PHONE.HELP_LINE_1)}>
                📞 Call {APP_LINKS.PHONE.HELP_LINE_1}
              </Button>

              <Button
                size="lg"
                activeOpacity={0.8}
                onPress={() => openPhoneNumber(APP_LINKS.PHONE.HELP_LINE_2)}>
                📞 Call {APP_LINKS.PHONE.HELP_LINE_2}
              </Button>
            </View>
          </View>

          {/* Quick Link to Privacy Policy */}
          <View className="gap-3 rounded-md border border-border bg-card p-4">
            <View className="flex-row items-center gap-3">
              <View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-full">
                <Icon name="book-01" size={18} className="text-primary" />
              </View>
              <Text className="flex-1 text-base font-semibold text-foreground">Privacy Policy</Text>
            </View>

            <Text className="text-center text-base leading-relaxed text-muted-foreground">
              Review how your personal data is collected, used, and protected in the{' '}
              <Text className="font-semibold text-foreground">Privacy Policy</Text>.
            </Text>

            <Button
              variant="outline"
              size="lg"
              onPress={() => navigate(PAGE_ROUTES.PRIVACY)}
              className="flex-row items-center gap-2"
              accessibilityLabel="Open privacy policy">
              <Icon name="book-01" size={18} className="text-primary" />
              <Text className="text-base font-semibold text-primary">Privacy Policy</Text>
            </Button>
          </View>
        </View>

        {/* Guide Sections */}
        <View className="gap-3 rounded-md border border-border bg-card p-4">
          <Text className="text-lg font-bold text-foreground">Step-by-Step Guides</Text>
          <Text className="text-sm font-medium leading-relaxed text-muted-foreground">
            Tap a guide below to see simple instructions for that task.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open step-by-step guide to get started with the app"
            onPress={() => navigate(PAGE_ROUTES.USER_MANUAL.GETTING_STARTED)}
            className="flex-row items-center gap-3 rounded-md border border-border bg-white p-4 active:opacity-80">
            <View className="bg-primary/10 h-11 w-11 items-center justify-center rounded-full">
              <Icon name="rocket-01" size={20} className="text-primary" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-bold text-foreground">Getting Started</Text>
              <Text className="text-sm font-medium leading-snug text-muted-foreground">
                Step-by-step instructions
              </Text>
            </View>
            <Text className="text-xl font-semibold leading-none text-muted-foreground">›</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open step-by-step guide for digital life registration"
            onPress={() => navigate(PAGE_ROUTES.USER_MANUAL.DLC)}
            className="flex-row items-center gap-3 rounded-md border border-border bg-white p-4 active:opacity-80">
            <View className="bg-primary/10 h-11 w-11 items-center justify-center rounded-full">
              <Icon name="camera-01" size={20} className="text-primary" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-bold text-foreground">Digital Life Registration</Text>
              <Text className="text-sm font-medium leading-snug text-muted-foreground">
                Step-by-step instructions
              </Text>
            </View>
            <Text className="text-xl font-semibold leading-none text-muted-foreground">›</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open step-by-step guide for changing your password"
            onPress={() => navigate(PAGE_ROUTES.USER_MANUAL.CHANGE_PASSWORD)}
            className="flex-row items-center gap-3 rounded-md border border-border bg-white p-4 active:opacity-80">
            <View className="bg-primary/10 h-11 w-11 items-center justify-center rounded-full">
              <Icon name="shield" size={20} className="text-primary" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-base font-bold text-foreground">Change Password</Text>
              <Text className="text-sm font-medium leading-snug text-muted-foreground">
                Step-by-step instructions
              </Text>
            </View>
            <Text className="text-xl font-semibold leading-none text-muted-foreground">›</Text>
          </Pressable>
        </View>
        <FooterImg />
      </Container>
    </SafeAreaView>
  );
}
