import React from 'react';
import { Image, Text, View } from 'react-native';

import type { UserManualStepImageProps } from '../types';

/**
 * High-contrast image placeholder / container for senior guidance.
 *
 * Renders an instructional screenshot when {@link UserManualStepImageProps.source} is
 * provided; otherwise shows a large dashed placeholder with
 * {@link UserManualStepImageProps.placeholderText}. When a caption is supplied it is
 * displayed in a dark "Look for this" bar beneath the image.
 *
 * @param props - Component props. See {@link UserManualStepImageProps}.
 * @returns A bordered image or placeholder block with optional caption bar.
 */
export const UserManualStepImage: React.FC<UserManualStepImageProps> = ({
  source,
  caption,
  placeholderText = 'App Screen Guide Placeholder',
}) => (
  <View className="my-3 overflow-hidden rounded-md border border-gray-300 bg-gray-50 ">
    {source ? (
      <View className="h-[32rem] w-full items-center justify-center">
        <Image
          source={source}
          className="h-full w-full object-cover"
          accessibilityLabel={caption || 'Instructional step visual guide'}
          resizeMode="contain"
        />
      </View>
    ) : (
      <View className="h-48 w-full items-center justify-center border-b-2 border-dashed border-gray-300 bg-gray-100 p-4">
        <Text className="text-center text-3xl">📱</Text>
        <Text className="mt-2 text-center text-base font-bold text-slate-700">
          {placeholderText}
        </Text>
      </View>
    )}
    {caption && (
      <View className="bg-gray-800 p-3.5">
        <Text className="text-center text-sm font-bold leading-5 text-white">
          💡 Look for this: {caption}
        </Text>
      </View>
    )}
  </View>
);
