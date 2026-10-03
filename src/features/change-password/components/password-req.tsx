import { View, Text } from 'react-native';
import { Icon } from '@components/ui/icon';
import { PASSWORD_RULES } from '../utils/constants/password-rule';

export const PasswordRequiredments = ({ value }: { value: string }) => {
  return (
    <View className="bg-muted/30 gap-2 rounded-xl p-3">
      <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Password Requirements
      </Text>

      <View className="gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const isMet = rule.test(value);

          return (
            <View key={rule.key} className="flex-row items-center gap-2">
              <Icon
                name={isMet ? 'check-circle' : 'circle'}
                size={12}
                color={isMet ? '#10b981' : '#a1a1aa'}
              />

              <Text
                className={`text-sm ${
                  isMet ? 'font-medium text-emerald-700' : 'text-muted-foreground'
                }`}>
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
