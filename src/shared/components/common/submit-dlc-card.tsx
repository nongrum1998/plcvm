import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { Ternary } from './ternary';
import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { useNetworkStatus } from '@hooks/use-network-status';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { View, Text } from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@stores/auth.store';
import { isWithinProcessingPeriod } from '@utils/helpers/is-within-processing-period';

export const SubmitDLCCard = () => {
  const { navigate } = useSafeNavigation();
  const { hasPermission, requestPermission, canRequestPermission } = useCameraPermission();
  const { user } = useAuthStore();

  const frontCamera = useCameraDevice('front');
  const { isOffline } = useNetworkStatus();

  const isDisableCapture = frontCamera === null || !hasPermission;

  const handleCapturePress = () => {
    navigate(PAGE_ROUTES.DLC);
  };

  const openSettings = async () => await Linking.openSettings();

  return (
    <View className="gap-3 rounded-md border border-border bg-card p-4">
      <View className="flex-row items-center gap-3">
        <Text className="flex-1 text-base font-semibold text-foreground">
          Digital Life Certificate
        </Text>
      </View>

      <Text className="text-center text-base leading-relaxed text-muted-foreground">
        Submit a quick photo to verify your identity and complete your Digital Life Certificate.
      </Text>

      <Ternary
        condition={hasPermission}
        ifTrue={
          <Button
            disabled={
              isDisableCapture ||
              isOffline ||
              isWithinProcessingPeriod(user?.app_date, user?.app_exp)
            }
            size="lg"
            onPress={handleCapturePress}
            activeOpacity={0.8}>
            Submit DLC
          </Button>
        }
        ifFalse={
          <Ternary
            condition={canRequestPermission}
            ifTrue={
              <>
                <Alert variant="destructive">
                  <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />

                  <View className="flex-1">
                    <AlertTitle className="text-sm">Camera Access Required</AlertTitle>

                    <AlertDescription>
                      Camera access is required to capture a photo. Please grant camera permission
                      to continue.
                    </AlertDescription>
                  </View>
                </Alert>

                <Button
                  size="lg"
                  disabled={!canRequestPermission}
                  variant="outline"
                  onPress={requestPermission}
                  activeOpacity={0.8}>
                  Allow Camera Access
                </Button>
              </>
            }
            ifFalse={
              <>
                <Alert variant="destructive">
                  <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />

                  <View className="flex-1">
                    <AlertTitle className="text-sm">Camera Access Blocked</AlertTitle>

                    <AlertDescription>
                      Camera permission has been denied. Please enable camera access in your app
                      settings to continue.
                    </AlertDescription>
                  </View>
                </Alert>

                <Button size="lg" variant="outline" onPress={openSettings} activeOpacity={0.8}>
                  Open App Settings
                </Button>
              </>
            }
          />
        }
      />
    </View>
  );
};
