import React, { useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';
import { useAppUpdateStore } from '@stores/update.store';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';

export const UpdateModal: React.FC = () => {
  const isUpdateReady = useAppUpdateStore((s) => s.isUpdateReady);
  const isDownloading = useAppUpdateStore((s) => s.isDownloading);
  const runUpdate = useAppUpdateStore((s) => s.runUpdate);
  const skipUpdate = useAppUpdateStore((s) => s.skipUpdate);
  const checkAndDownloadUpdate = useAppUpdateStore((s) => s.checkAndDownloadUpdate);

  useEffect(() => {
    checkAndDownloadUpdate();
  }, [checkAndDownloadUpdate]);

  if (!isUpdateReady && !isDownloading) return null;

  return (
    <Modal transparent animationType="fade" visible={isUpdateReady || isDownloading}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full overflow-hidden rounded-md border border-white bg-white p-8">
          <View className="items-center">
            <View className="bg-primary/10 mb-4 h-16 w-16 items-center justify-center rounded-md">
              <Icon name="rocket-01" size={32} className="text-primary" />
            </View>

            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              {isDownloading ? 'Downloading Update...' : 'New Update Available!'}
            </Text>

            <Text className="mb-8 text-center text-base text-gray-600">
              {isDownloading
                ? 'We are downloading the latest version to ensure you have the best experience.'
                : 'A new version of the app is ready. Install it now to get the latest features and fixes.'}
            </Text>

            {isDownloading ? (
              <ActivityIndicator color="#3b82f6" size="large" />
            ) : (
              <View className="w-full gap-4">
                <Button onPress={runUpdate} size={'lg'} className="w-full">
                  Update Now
                </Button>
                <Button variant={'secondary'} onPress={skipUpdate} className="w-full" size={'lg'}>
                  Remind Later
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
