import { Container } from '@components/layout';
import { APP_VERSION } from '@utils/constants';
import { Text, View } from 'react-native';

export default function WithdrawalScreen() {
  return (
    <Container scrollable className="">
      <View className="flex-grow">
        <View className="gap-6">
          {/* Header Banner */}
          <View className="gap-2">
            <View className="bg-primary/10 self-start py-1">
              <Text className="text-sm font-bold uppercase tracking-wider text-primary">
                Service Request
              </Text>
            </View>

            <Text className="text-2xl font-extrabold tracking-tight text-foreground">
              {`Pensioner's`} Life Certificate
            </Text>
            <Text className="text-sm font-medium text-muted-foreground">
              Application Withdrawal & Notice
            </Text>
          </View>

          {/* Main Info Card */}
          <View className="gap-5 rounded-md border border-gray-200/60 bg-white p-6">
            <View className="flex-row items-center justify-between border-b border-gray-200 pb-4">
              <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                App Details
              </Text>
              <View className="rounded-full border border-gray-200 bg-secondary px-3 py-1">
                <Text className="text-sm font-bold text-secondary-foreground">v{APP_VERSION}</Text>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-base font-bold text-card-foreground">Treasury Request</Text>
              <Text className="text-sm leading-6 text-muted-foreground">
                A request can be made to the Treasury Office by any user who wants to stop using the
                application.
              </Text>
            </View>
          </View>

          {/* Additional Guidance Box */}
          <View className="bg-muted/40 gap-2 rounded-md border border-gray-500/50 p-5">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-primary" />
              <Text className="text-sm font-bold uppercase tracking-wider text-foreground">
                Important Notice
              </Text>
            </View>
            <Text className="text-sm leading-5 text-muted-foreground">
              Please contact your designated Treasury Office to submit and finalize your withdrawal
              procedure.
            </Text>
          </View>
        </View>
      </View>
    </Container>
  );
}
