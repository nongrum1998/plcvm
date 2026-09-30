import { View, Text } from 'react-native';
import { cn } from '@utils';
import { Container } from '../layout';
import { Icon, Button } from '../ui';

interface EmptyScreenProps {
  title: string;
  refresh?: () => void;
  message?: string;
  refreshLabel?: string;
}

/**
 * Full-screen empty state shown when a list or view has no content to render.
 *
 * Renders a centred title, an optional supporting `message`, and a single
 * call-to-action button. The button is always rendered so the layout stays
 * stable across the empty and non-empty branches; pressing it invokes
 * `refresh` when one is supplied and is a no-op otherwise.
 *
 * When no `message` is given a spacer view is rendered instead, keeping the
 * vertical gap between the title and the button constant between variants.
 *
 * @param props.title Headline text. Required.
 * @param props.refresh Optional invoked on button press (e.g. a refetch).
 * @param props.message Optional supporting copy below the title.
 * @param props.refreshLabel Button label. Defaults to 'Refresh'.
 * @example
 * <EmptyScreen title="No statements" message="Nothing here yet" refresh={refetch} />
 */
export const EmptyScreen = ({
  title,
  refresh,
  message,
  refreshLabel = 'Refresh',
}: EmptyScreenProps) => {
  return (
    <Container className={cn('flex-1 items-center justify-center px-6')}>
      <View className={cn('mb-6 h-24 w-24 items-center justify-center rounded-md bg-primary')}>
        <Icon name="file-not-found" className="text-white" size={48} />
      </View>

      <Text className={cn('mb-2 text-center text-2xl font-bold text-foreground')}>{title}</Text>

      {message && (
        <Text className={cn('text-graphite mb-8 text-center text-base leading-6')}>{message}</Text>
      )}

      {!message && <View className={cn('mb-8')} />}

      <Button onPress={() => refresh?.()} activeOpacity={0.8}>
        {refreshLabel}
      </Button>
    </Container>
  );
};

EmptyScreen.displayName = 'EmptyScreen';
