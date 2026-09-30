import { View, Text } from 'react-native';

export const NicBanner = () => {
  return (
    <View className="w-full items-center justify-center bg-primary px-4 py-1.5">
      <Text className="text-center text-[11px] font-medium tracking-wide text-white">
        Powered by NIC • Meghalaya State Centre
      </Text>
    </View>
  );
};
