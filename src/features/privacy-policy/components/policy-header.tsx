import React from 'react';
import { Text, View } from 'react-native';

/** Title banner for the Privacy Policy screen: Support badge, page title, and app subtitle. Purely presentational. */
export const PolicyHeader: React.FC = () => (
  <View className="gap-2">
    <View className="bg-primary/10 self-start py-1">
      <Text className="text-sm font-bold uppercase tracking-wider text-primary">Support</Text>
    </View>

    <Text className="text-2xl font-extrabold tracking-tight text-foreground">Privacy Policy</Text>

    <Text className="text-sm font-medium text-muted-foreground">
      {`Pensioner's`} Life Certificate Verification App
    </Text>
  </View>
);
