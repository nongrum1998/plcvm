import { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { useRoutePath } from '@hooks/use-route-path';
import { matchPageHeader } from '@utils/helpers/page/match-page-header';
import { cn } from '@utils/helpers/cn';
import { NetworkStatusBanner } from '../common/network-status-banner';
import { Icon } from '../ui/icon';
import { DrawerToggleButton } from 'expo-router/drawer';
import { NicBanner } from '@components/common/nic-banner';
import { PAGE_HEADERS } from '@config/page-headers';

export const StackHeader = memo(() => {
  const path = useRoutePath();
  const config = useMemo(() => matchPageHeader(path, PAGE_HEADERS), [path]);
  const { back } = useSafeNavigation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const canGoBack = navigation.canGoBack();

  const handleBack = useCallback(() => back(), [back]);

  if (!config) return null;

  const showBack = config.showBackButton && canGoBack;
  const showDrawer = config.showDrawer;
  const showPlaceHolder = showBack || showDrawer;

  return (
    <View className={cn('border-b border-gray-200 bg-white')} style={{ paddingTop: insets.top }}>
      {/* Header Main Bar */}
      <View className="min-h-[56px] flex-row items-center justify-between gap-x-3 p-3">
        <View className="min-w-[40px] flex-row items-center justify-start">
          {showDrawer ? (
            <DrawerToggleButton tintColor={'#000'} />
          ) : (
            showBack && (
              <TouchableOpacity
                onPress={handleBack}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.7}>
                <Icon name="arrow-left" size={26} />
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Title */}
        <View className="flex-1 items-center justify-center">
          <Text numberOfLines={1} className="text-lg font-bold tracking-wide text-gray-900">
            {config.title}
          </Text>
        </View>

        {/* Right Action Placeholder */}
        <View className="min-w-[40px] items-end">
          {showPlaceHolder && <View className="w-6" />}
        </View>
      </View>

      {/* Optional Custom Bottom Header Content */}
      {config.bottomContent && <View className="px-4 pb-3">{config.bottomContent}</View>}

      {/* Banner docked right below the header */}
      <NicBanner />
      <NetworkStatusBanner />
    </View>
  );
});

StackHeader.displayName = 'StackHeader';
