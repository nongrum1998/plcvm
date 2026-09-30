import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StackHeader } from './stack-header';

/**
 * Layout root for feature directories that need a custom header plus
 * slide-transition animations between their child screens.
 *
 * Must only be used as the root element of a `_layout.tsx` (i.e. the full
 * return value of a route layout), where Expo Router supplies the file-based
 * route context the Stack resolves. Renders a static `StackHeader` above a
 * native-stack navigator; the screens slide in beneath the header during
 * transitions.
 *
 * The header is intentionally outside the navigator so it stays fixed while
 * screens animate in. Navigation state (titles, back affordance) is read from
 * the active route via `StackHeader`, so it updates per screen automatically.
 */
export const StackHeaderLayout = () => (
  <View className="flex-1">
    <StackHeader />
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
  </View>
);

StackHeaderLayout.displayName = 'StackHeaderLayout';
