import { View, Text } from 'react-native';
import { cn } from '@utils';
import { Container } from '../layout';
import { Icon, Button } from '../ui';

/**
 * Props for the {@link ErrorScreen} component.
 */
interface ErrorScreenProps {
  /** Headline describing the failure. Required. */
  title: string;
  /** Supporting copy explaining what went wrong. Required. */
  description: string;
  /**
   * Invoked when the retry button is pressed, typically to re-run the failed
   * request or reset the form. When omitted, no action button is rendered.
   */
  onRetry?: () => void;
  /** Label for the retry button. Defaults to 'Try Again'. */
  retryLabel?: string;
}

/**
 * Full-screen error state shown when an operation fails.
 *
 * Renders a destructive-tinted alert badge, the `title` headline and the
 * `description` supporting copy, all vertically centred. When `onRetry` is
 * supplied a single retry action is rendered below the copy; without it the
 * screen is display-only and the caller decides how the user recovers.
 *
 * Unlike `Forbidden` or `NotFoundScreen`, this screen performs no navigation
 * and reads no store — it is purely presentational. Consumers own their own
 * recovery (retrying a mutation, navigating home, signing out) and pass the
 * resulting handler as `onRetry`.
 *
 * @param props.title Headline describing the failure. Required.
 * @param props.description Supporting copy below the title. Required.
 * @param props.onRetry Optional invoked on retry button press. When omitted,
 *   no button is rendered.
 * @param props.retryLabel Label for the retry button. Defaults to 'Try Again'.
 * @example
 * <ErrorScreen
 *   title="Upload Failed"
 *   description="We could not upload your document. Please try again."
 *   onRetry={refetch}
 * />
 *
 * @example
 * <ErrorScreen title="Session Expired" description="Please sign in again." />
 */
export const ErrorScreen = ({
  title,
  description,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorScreenProps) => {
  return (
    <Container className={cn('flex-1 items-center justify-center px-6')}>
      <View
        className={cn('bg-destructive/10 mb-6 h-24 w-24 items-center justify-center rounded-md')}>
        <Icon name="alert-circle" className="text-destructive" size={48} />
      </View>

      <Text className={cn('mb-2 text-center text-2xl font-bold text-foreground')}>{title}</Text>

      <Text className={cn('text-graphite mb-8 text-center text-base leading-6')}>
        {description}
      </Text>

      {onRetry && (
        <Button onPress={onRetry} size={'lg'} activeOpacity={0.8}>
          {retryLabel}
        </Button>
      )}
    </Container>
  );
};

ErrorScreen.displayName = 'ErrorScreen';
