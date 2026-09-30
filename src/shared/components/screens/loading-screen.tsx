import { ActivityIndicator, Text, View } from 'react-native';

/**
 * Centred full-screen loading indicator with a "Loading" caption.
 *
 * Intended to be returned early from a screen while its data is in flight.
 * Declared as a component (`() => <LoadingScreen />`) rather than a bare
 * element: a bare element would evaluate once at module load into a fixed
 * `Element` value, which cannot be mounted as `<LoadingScreen />` and loses
 * the parent-tree context it is rendered in.
 *
 * @example
 * if (isLoading) return <LoadingScreen />;
 */
export const LoadingScreen = () => {
  return (
    <View className={'flex-1 items-center justify-center gap-4'}>
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="text-lg font-bold uppercase tracking-wider text-primary">Loading</Text>
    </View>
  );
};
