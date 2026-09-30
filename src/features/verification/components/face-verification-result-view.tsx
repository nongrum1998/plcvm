import { Text, View } from 'react-native';
import { Button, Ternary } from '@components';
import { Container } from '@components/layout';
import { useSafeNavigation } from '@hooks';

/** Props for {@link FaceVerificationResultView}. */
export interface FaceVerificationResultViewProps {
  /** Envelope success flag that selects the result card. */
  isSuccess: boolean;
  /** Backend message to display unchanged. */
  message: string;
  /** Called when the user chooses to retake after a failed result. */
  onRetakePress?: () => void;
  onGoBack?: () => void;
}

/**
 * Renders the successful verification card and its existing home navigation.
 *
 * The card keeps the backend message unchanged when present and uses a local
 * fallback only for an empty message. It is exported for reuse by the result
 * container and does not submit or capture data.
 */
export const SuccessStatusCard = ({
  message,
  onGoBack,
}: {
  message: string;
  onGoBack?: () => void;
}) => {
  const { back } = useSafeNavigation();
  return (
    <View className="gap-y-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-500">
          <Text className="text-base font-black text-white">✓</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-emerald-900">Verification Successful</Text>
          <Text className="text-sm font-semibold text-emerald-700">Identity confirmed</Text>
        </View>
      </View>

      <View className="gap-y-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <Text className="text-sm font-bold uppercase tracking-wider text-emerald-900">
            Official Approval
          </Text>
        </View>
        <Text className="text-sm font-medium leading-relaxed text-emerald-950/80">
          Your photo has been successfully submitted and is approved by the Treasury Officer at your
          registered Treasury Office for pension disbursement.
        </Text>
      </View>

      <View className="h-[1px] w-full bg-emerald-500/20" />

      <Text className="text-center text-lg font-medium leading-relaxed text-emerald-950/80">
        {message || 'Your face verification was processed and matched successfully.'}
      </Text>
      <Button
        size="lg"
        variant="primary"
        onPress={() => {
          onGoBack && onGoBack();
          back();
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
  /** Optional same-screen retake callback. */
  onRetakePress?: () => void;
}

/**
 * Renders a backend failure card with no internal navigation.
 *
 * The retake action is rendered only when the screen supplies a callback. The
 * card preserves the backend message and uses a local fallback only when the
 * message is empty.
 */
export const RejectStatusCard = ({ message, onRetakePress }: RejectStatusCardProps) => {
  return (
    <View className="items-center gap-y-4 rounded-md border border-red-500/20 bg-red-500/20 p-5">
      <View className="mt-2 w-full items-center">
        <Text className="mb-1 text-center text-lg font-bold text-destructive">
          Photo Verification Failed
        </Text>
        <Text className="text-destructive/90 text-center text-sm font-medium leading-relaxed">
          {message ||
            'The uploaded photo could not be verified. Please ensure proper lighting and a clear view.'}
        </Text>
      </View>

      {onRetakePress ? (
        <Button size="lg" variant="destructive" onPress={onRetakePress} className="w-full">
          Retake Photo
        </Button>
      ) : null}
    </View>
  );
};

/**
 * Presents the envelope-driven result for a completed DLC submission.
 *
 * Only `isSuccess` chooses between the cards. A failed result delegates
 * retake to `onRetakePress`, keeping technical error handling in the screen.
 */
export function FaceVerificationResultView({
  isSuccess,
  message,
  onRetakePress,
  onGoBack,
}: FaceVerificationResultViewProps) {
  return (
    <Container className="gap-y-5">
      {/* Header Section */}
      <View className="gap-2">
        <View className="bg-primary/10 self-start rounded-full py-1">
          <Text className="text-sm font-bold uppercase tracking-wider text-primary">
            Verification
          </Text>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Identity Verification
        </Text>

        <Text className="text-sm font-medium text-muted-foreground">
          Review your status details below to proceed.
        </Text>
      </View>

      <Ternary
        condition={isSuccess}
        ifTrue={<SuccessStatusCard onGoBack={onGoBack} message={message} />}
        ifFalse={<RejectStatusCard message={message} onRetakePress={onRetakePress} />}
      />
    </Container>
  );
}
