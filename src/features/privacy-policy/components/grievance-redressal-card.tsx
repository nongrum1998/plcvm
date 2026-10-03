import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { APP_LINKS } from '@utils/constants/app-link';
import { openEmailAddress } from '@utils/helpers/linking/app-linking';

/** Amber Section-8 grievance callout. Tapping the underlined address opens the mail client with {@link APP_LINKS.EMAIL.MEG_PLCV}. */
export const GrievanceRedressalCard: React.FC = () => (
  <View className="gap-2 rounded-md border border-amber-300 bg-amber-50 p-4">
    <Text className="text-sm font-bold text-amber-950">8. Grievance Redressal</Text>
    <Text className="text-sm leading-5 text-amber-950">
      If you have any questions or concerns regarding this Privacy Policy, you may write to:
    </Text>
    <TouchableOpacity
      onPress={() => openEmailAddress(APP_LINKS.EMAIL.MEG_PLCV)}
      activeOpacity={0.7}>
      <Text className="text-sm font-bold text-primary underline">{APP_LINKS.EMAIL.MEG_PLCV}</Text>
    </TouchableOpacity>
  </View>
);
