import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { cn } from '@utils';

interface KeyboardSafeViewProps {
  children: React.ReactNode;
  className?: string;
  contentContainerClassName?: string;
  useSafeArea?: boolean;
  safeAreaEdges?: Edge[];
  /**
   * Whether tapping the background should dismiss the keyboard.
   * Handled via ScrollView props for better scroll performance.
   */
  dismissKeyboardOnTap?: boolean;
  extraScrollHeight?: number;
  scrollEnabled?: boolean;
}

/**
 * A production-ready shared component for handling keyboard interactions.
 * Optimized to ensure no touch-blocking occurs during scrolling.
 */
export const KeyboardSafeView: React.FC<KeyboardSafeViewProps> = ({
  children,
  className = '',
  contentContainerClassName = '',
  useSafeArea = true,
  safeAreaEdges = ['bottom', 'left', 'right'],
  dismissKeyboardOnTap = true,
  extraScrollHeight = 20,
  scrollEnabled = true,
}) => {
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container edges={safeAreaEdges} className="flex-1">
      <KeyboardAwareScrollView
        className={cn('flex-1', className)}
        contentContainerStyle={styles.contentContainer}
        contentContainerClassName={cn(contentContainerClassName)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={dismissKeyboardOnTap ? 'on-drag' : 'none'}
        enableOnAndroid={true}
        extraScrollHeight={extraScrollHeight}
        scrollEnabled={scrollEnabled}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={0}
        scrollEventThrottle={16}
        bounces={true}
        showsVerticalScrollIndicator={false}>
        {children}
      </KeyboardAwareScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});
