import { View, Text } from 'react-native';

type ProfileUpdateFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function ProfileUpdateField({ label, error, children }: ProfileUpdateFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>

      {children}

      {!!error && (
        <Text className="mt-1 text-sm text-destructive" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}
