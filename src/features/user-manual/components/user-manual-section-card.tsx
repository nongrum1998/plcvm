import React from 'react';
import { Text, View } from 'react-native';

import type { UserManualSectionCardProps } from '../types';

/**
 * Senior-friendly section card with large header badges and high contrast.
 *
 * Displays a numbered circular badge beside a bold title in the card header,
 * separated from {@link UserManualSectionCardProps.children} by a divider.
 *
 * @param props - Component props. See {@link UserManualSectionCardProps}.
 * @returns A white card containing the numbered header and body content.
 */
export const UserManualSectionCard: React.FC<UserManualSectionCardProps> = ({
  stepNumber,
  title,
  children,
}) => (
  <View className="gap-4 rounded-md border border-gray-300 bg-white p-5 ">
    <View className="flex-row items-center gap-3 border-b-2 border-gray-200 pb-4">
      {stepNumber && (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-700">
          <Text className="text-xl font-black text-white">{stepNumber}</Text>
        </View>
      )}
      <Text className="flex-1 text-xl font-black tracking-wide text-slate-900">{title}</Text>
    </View>
    <View className="gap-4 pt-1">{children}</View>
  </View>
);
