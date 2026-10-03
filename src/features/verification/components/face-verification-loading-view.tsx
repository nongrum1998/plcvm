import { FooterImg } from '@components/common/nic-footer-img';
import { LoadingScreen } from '@components/screens/loading-screen';
import { View } from 'react-native';

/**
 * Full-screen busy indicator shown during the `capturing` and
 * `submitting` phases of FaceVerificationScreen. Static content;
 * no props, no side effects.
 */
export function FaceVerificationLoadingView() {
  return (
    <View className="flex-1 items-center justify-center">
      <LoadingScreen />
      <View className="absolute bottom-0">
        <FooterImg />
      </View>
    </View>
  );
}
