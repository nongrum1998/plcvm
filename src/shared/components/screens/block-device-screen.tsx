import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Full-screen state shown when the device is jailbroken/rooted or has a
 * debugger attached in production.
 *
 * Renders a centered security-block icon with a title and explanation. There
 * are no action buttons: a compromised device must not proceed into the app,
 * and the screen is intentionally dismiss-free. Wrapped in a `SafeAreaView`
 * so content avoids notches on both platforms.
 *
 * @example
 * <BlockedDeviceScreen />
 */
export const BlockedDeviceScreen = () => {
  return (
    <SafeAreaView className="bg-background">
      <View className="items-center gap-y-5 px-6">
        <Text className="text-center text-3xl font-bold tracking-widest text-foreground">
          Device Not Verified
        </Text>

        <Text className="text-center text-base leading-6 text-muted-foreground">
          We could not verify the security of this device. Access to this app is restricted on
          jailbroken, rooted, or debugged devices to protect your account.
        </Text>
      </View>
    </SafeAreaView>
  );
};
