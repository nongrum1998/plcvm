import React from 'react';
import { Text, View } from 'react-native';

/** General overview card describing data collection context (NIC / Government of Meghalaya) and liability disclaimer. Purely presentational. */
export const PolicyOverviewCard: React.FC = () => (
  <View className="bg-primary/5 gap-2 rounded-md border border-primary p-4">
    <Text className="text-justify text-sm leading-5 text-foreground">
      When you use{' '}
      <Text className="font-bold">Pensioner’s Life Certificate Verification (App)</Text> hosted by
      the National Informatics Centre (NIC) on behalf of{' '}
      <Text className="font-bold">Government of Meghalaya</Text>, personal information is collected
      as detailed below.
    </Text>
    <Text className="text-justify text-sm leading-5 text-muted-foreground">
      The information provided through this application is for general reference only. Every effort
      has been made to provide accurate information, though neither NIC nor the Government of
      Meghalaya assumes liability for absolute accuracy. This policy may be revised periodically.
    </Text>
  </View>
);
