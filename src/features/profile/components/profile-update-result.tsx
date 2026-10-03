import { Text, View } from 'react-native';
import { Button } from '@components/ui/button';
import { Ternary } from '@components/common/ternary';

/** Props for {@link ProfileUpdateResultView}. */
export interface ProfileUpdateViewProps {
  /** Envelope success flag that selects the result card. */
  success: boolean;
  /** Backend message to display unchanged. */
  message: string;
  /** Called when the user chooses to return or retry after a failed result. */
  onBack: () => void;
}

/**
 * Renders the successful profile update/face verification result.
 *
 * The backend message is displayed unchanged when present and falls back
 * to a local success message when the message is empty.
 */
export const SuccessStatusCard = ({
  message,
  onGoBack,
}: {
  message: string;
  onGoBack: () => void;
}) => {
  return (
    <View className="gap-y-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
          <Text className="text-base font-black text-white">✓</Text>
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-emerald-900">Profile Update Successful</Text>
          <Text className="text-sm font-semibold text-emerald-700">Profile Update completed</Text>
        </View>
      </View>

      <View className="gap-y-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

          <Text className="text-sm font-bold uppercase tracking-wider text-emerald-900">
            Profile updated
          </Text>
        </View>

        <Text className="text-sm font-medium leading-relaxed text-emerald-950/80">
          Your profile has been updated. Please re-login to see the updated changes
        </Text>
      </View>

      <View className="h-[1px] w-full bg-emerald-500/20" />

      <Text className="text-center text-lg font-medium leading-relaxed text-emerald-950/80">
        {message || 'Your profile has been updated.'}
      </Text>

      <Button
        size="lg"
        variant="primary"
        onPress={() => {
          onGoBack();
        }}>
        Go Back
      </Button>
    </View>
  );
};

/** Props for {@link RejectStatusCard}. */
export interface RejectStatusCardProps {
  /** Backend failure message to display unchanged. */
  message: string;
  /** Callback invoked when the user chooses to retry. */
  onBack: () => void;
}

/**
 * Renders the failed profile update/face verification result.
 *
 * The backend failure message is displayed unchanged when present and
 * falls back to a local failure message when the message is empty.
 */
export const RejectStatusCard = ({ message, onBack }: RejectStatusCardProps) => {
  return (
    <View className="gap-y-5 rounded-md border border-red-500/30 bg-red-500/10 p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-red-500">
          <Text className="text-base font-black text-white">!</Text>
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-red-900">Profile Update Failed</Text>
          <Text className="text-sm font-semibold text-red-700">
            Profile update was not completed
          </Text>
        </View>
      </View>

      <View className="gap-y-1.5 rounded-md border border-red-500/30 bg-red-500/10 p-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-red-500" />

          <Text className="text-sm font-bold uppercase tracking-wider text-red-900">
            Update Failed
          </Text>
        </View>

        <Text className="text-sm font-medium leading-relaxed text-red-950/80">
          We could not complete your profile update.
        </Text>
      </View>

      <View className="h-[1px] w-full bg-red-500/20" />

      <Text className="text-center text-lg font-medium leading-relaxed text-red-950/80">
        {message || 'Your face verification could not be completed. Please try again.'}
      </Text>

      <Button size="lg" variant={'destructive'} onPress={onBack}>
        Try Again
      </Button>
    </View>
  );
};

/**
 * Presents the envelope-driven result for a completed profile update.
 *
 * The `success` flag selects the appropriate result card. Failed results
 * delegate the retry action to `onBack`.
 */
export function ProfileUpdateResultView({ success, message, onBack }: ProfileUpdateViewProps) {
  return (
    <View className="gap-y-5">
      <Ternary
        condition={success}
        ifTrue={<SuccessStatusCard onGoBack={onBack} message={message} />}
        ifFalse={<RejectStatusCard message={message} onBack={onBack ?? (() => undefined)} />}
      />
    </View>
  );
}
