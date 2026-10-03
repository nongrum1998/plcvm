import React, { useEffect } from 'react';
import { Modal, View, Pressable, ViewProps, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { cn } from '@utils/helpers/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * Premium Dialog Root with Reanimated Transitions
 */
export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <Modal
      transparent
      visible={open}
      animationType="none" // We handle EVERYTHING via Reanimated for smoothness
      statusBarTranslucent
      onRequestClose={() => onOpenChange(false)}>
      {children}
    </Modal>
  );
};

interface DialogContentProps extends ViewProps {
  onClose?: () => void;
}

/**
 * High-fidelity Dialog Content shell
 */
export const DialogContent = ({ children, className, onClose, ...props }: DialogContentProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(1, {
      damping: 20,
      stiffness: 150,
      mass: 0.8,
    });

    return () => {
      progress.value = 0;
    };
  }, [progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1], Extrapolate.CLAMP) }],
  }));

  const handleClose = () => {
    // Trigger a 200ms fade-out animation, then notify the parent via runOnJS
    progress.set(
      withTiming(0, { duration: 200 }, () => {
        // runOnJS bridges from the Reanimated UI thread to the React JS thread
        if (onClose) {
          runOnJS(onClose)();
        }
      })
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]} className="bg-black/50">
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Content Container */}
      <View
        style={StyleSheet.absoluteFill}
        className="pointer-events-box-none items-center justify-center px-4">
        <Animated.View
          style={[contentStyle]}
          className={cn(
            'w-full max-w-sm rounded-md bg-card p-6 shadow-2xl dark:bg-gray-800',
            className
          )}
          {...props}>
          <Pressable onPress={(e) => e.stopPropagation()}>{children}</Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

export const DialogHeader = ({ className, ...props }: ViewProps) => (
  <View className={cn('mb-4 gap-y-1', className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: ViewProps) => (
  <View className={cn('mt-6 flex-row justify-end gap-x-3', className)} {...props} />
);

export const DialogTitle = ({ className, ...props }: React.ComponentProps<typeof Text>) => (
  <Text className={cn('text-xl text-foreground', className)} {...props} />
);

export const DialogDescription = ({ className, ...props }: React.ComponentProps<typeof Text>) => (
  <Text className={cn('text-sm text-muted-foreground', className)} {...props} />
);
