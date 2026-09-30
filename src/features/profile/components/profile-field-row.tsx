import { View, Text } from 'react-native';

type Props = {
  label: string;
  value: string;
};

/**
 * A single read-only labeled row used on the profile display screen.
 *
 * Renders the field label on the left (uppercased) and the value on the right,
 * truncating long values after two lines.
 */
export function ProfileFieldRow({ label, value }: Props) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 py-3">
      <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      <Text className="max-w-[60%] text-sm font-bold text-foreground" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}
