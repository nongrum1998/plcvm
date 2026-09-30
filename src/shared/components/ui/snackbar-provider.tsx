import { useEffect, useRef, useState } from 'react';
import { Animated, TouchableOpacity, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnackbarStore } from '@stores/snackbar.store';
import { Icon } from './icon';
import { cn } from '@utils';

const ANIMATION_DURATION = 250;
const AUTO_DISMISS_MS = 2000;

/**
 * A lightweight snackbar banner that slides in from the bottom of the screen.
 */
export const SnackbarProvider = () => {
  const message = useSnackbarStore((state) => state.message);
  const visible = useSnackbarStore((state) => state.visible);
  const icon = useSnackbarStore((state) => state.icon);
  const dismissSnackbar = useSnackbarStore((state) => state.dismissSnackbar);

  const insets = useSafeAreaInsets();

  const [translateY] = useState(() => new Animated.Value(150));
  const [opacity] = useState(() => new Animated.Value(0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // React to visibility becoming true (show animation)
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        useSnackbarStore.setState({ visible: false });
        timerRef.current = null;
      }, AUTO_DISMISS_MS);
    }
  }, [visible, translateY, opacity]);

  // React to visibility becoming false (dismiss animation)
  useEffect(() => {
    if (!visible && message !== null) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 150,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        dismissSnackbar();
      });
    }
  }, [visible, message, translateY, opacity, dismissSnackbar]);

  const handleTap = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    useSnackbarStore.setState({ visible: false });
  };

  if (!message && !visible) {
    return null;
  }

  return (
    <Animated.View
      className="absolute inset-x-0 z-[9999] items-center"
      style={{
        bottom: insets.bottom + 16,
        transform: [{ translateY }],
        opacity,
      }}
      pointerEvents="box-none">
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.85}
        accessibilityRole="alert"
        accessibilityLabel={message ?? undefined}>
        <View
          className={cn('elevation-6 max-w-[90%] flex-row items-center rounded-full px-4 py-3')}>
          {icon ? (
            <View className="mr-2">
              <Icon name={icon} size={24} className="text-white" />
            </View>
          ) : null}

          <Text numberOfLines={1} ellipsizeMode="tail" className={cn('text-sm font-medium')}>
            {message?.slice(0, 120)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
