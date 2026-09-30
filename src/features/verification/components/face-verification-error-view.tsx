import { View, Text } from 'react-native';
import { Button, Icon } from '@components';
import { Alert, AlertDescription, AlertTitle } from '@components/ui';
import { Container } from '@components/layout';
import { FooterImg } from '@components/common';
import { useSafeNavigation } from '@hooks';

/** Props for {@link FaceVerificationErrorView}. */
export interface FaceVerificationErrorViewProps {
  /** Human-readable failure message displayed in the alert body. */
  errorMsg: string;
  /** Invoked by the "Try Again" button; optional retry handler from the parent. */
  onTryAgainPress?: () => void;
}

/**
 * Renders a destructive alert with the failure reason, an optional Try
 * Again action, and a Go Back button for the error phase of
 * FaceVerificationScreen. The Go Back button uses the guarded
 * `useSafeNavigation` hook internally; retry is delegated to the parent
 * via `onTryAgainPress`.
 */
export function FaceVerificationErrorView({
  errorMsg,
  onTryAgainPress,
}: FaceVerificationErrorViewProps) {
  const { back } = useSafeNavigation();
  return (
    <Container className="gap-5">
      <View className="gap-2">
        <View className="bg-primary/10 self-start py-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-primary">
            Something went wrong
          </Text>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Face Verification failed
        </Text>

        <Text className="text-sm font-medium text-muted-foreground">
          Please try again after sometime.
        </Text>
      </View>
      <View className="items-center justify-center gap-5">
        <Alert variant="destructive">
          <Icon name="info" size={18} className="mt-0.5 text-destructive" />
          <View className="flex-1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </View>
        </Alert>

        <View className="gap-2">
          {onTryAgainPress && (
            <Button
              size="lg"
              className="w-full"
              onPress={() => onTryAgainPress && onTryAgainPress()}>
              Try Again
            </Button>
          )}
          <Button size="lg" variant={'secondary'} className="w-full" onPress={back}>
            Go Back
          </Button>
        </View>
      </View>
      <FooterImg />
    </Container>
  );
}
