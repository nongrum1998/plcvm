import { View, Text } from 'react-native';
import { Container } from '@components/layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_VERSION } from '@utils/constants';
import { FooterImg } from '@components/common';

export function AboutScreen() {
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <Container scrollable>
        <View className="w-full gap-5">
          {/* Header Badge */}
          <View className="gap-2">
            <View className="bg-primary/10 self-start py-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                About Us
              </Text>
            </View>

            <Text className="text-2xl font-extrabold tracking-tight text-foreground">
              {`Pensioner's`} Life Certificate Verification
            </Text>

            <Text className="text-sm font-medium text-muted-foreground">About this app</Text>
          </View>

          {/* Content Card */}
          <View className="gap-5 rounded-md border border-gray-200 bg-card p-5">
            {/* Version Pill */}
            <View className="items-center">
              <View className="bg-muted/60 rounded-full border border-gray-500/50 px-4 py-1.5">
                <Text className="text-xs font-bold text-foreground">Version {APP_VERSION}</Text>
              </View>
            </View>

            {/* Description Paragraphs */}
            <View className="gap-3.5">
              <View className="bg-muted/30 rounded-md border border-gray-200 p-3.5">
                <Text className="text-sm leading-5 text-muted-foreground">
                  This app is meant for the Pensioners of the Government of Meghalaya (Treasury PDA)
                  to enable them to prove their Liveness to the Pension Authorities.
                </Text>
              </View>

              <View className="bg-muted/30 rounded-md  border border-gray-200 p-3.5">
                <Text className="text-sm leading-5 text-muted-foreground">
                  The app has AI capabilities which can detect the {`pensioner's`} Liveness and also
                  verify the {`pensioner's`} authenticity with Face Verification Technology.
                </Text>
              </View>

              <View className="bg-muted/30 rounded-md border border-gray-200 p-3.5">
                <Text className="text-sm leading-5 text-muted-foreground">
                  The pensioner can also submit his/her Self Declaration for Non-Employment or
                  Non-Marriage and also track the status with this app.
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Logos */}
          <FooterImg />
        </View>
      </Container>
    </SafeAreaView>
  );
}
