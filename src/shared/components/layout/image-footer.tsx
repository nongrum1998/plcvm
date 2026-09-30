import React from 'react';

import { Image, ImageProps, View, Text } from 'react-native';
import * as Application from 'expo-application';

type ImageFooterProps = {
  images: { source: ImageProps['source']; alt: string }[];
};

export const ImageFooter = ({ images }: ImageFooterProps) => {
  const version = Application.nativeApplicationVersion;
  return (
    <View className="items-center">
      <View className="flex-row items-center justify-center gap-5">
        {images.map((img) => (
          <React.Fragment key={img.alt}>
            <Image source={img.source} className="h-14 w-28" resizeMode="contain" />
            <View className="h-5 w-[1px] bg-gray-200" />
          </React.Fragment>
        ))}
      </View>
      <Text className="text-center text-sm font-semibold tracking-wider text-gray-400">
        Version {version}
      </Text>
    </View>
  );
};
