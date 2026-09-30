import React from 'react';
import { Text, View } from 'react-native';

import type { PolicySectionProps } from '../types';

/** Reusable bordered card rendering one privacy-policy clause heading above its body content. Throws nothing; purely presentational. */
export const PolicySection: React.FC<PolicySectionProps> = ({ title, children }) => (
  <View className="gap-2 rounded-md border border-border bg-card p-4">
    <Text className="text-sm font-bold text-primary">{title}</Text>
    <View className="gap-2">{children}</View>
  </View>
);
