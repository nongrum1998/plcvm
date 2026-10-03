import { create } from 'zustand';
import * as ExpoUpdates from 'expo-updates';
import { logger } from '@utils/logger/logger';

type AppUpdateStore = {
  isUpdateAvailable: boolean;
  isUpdateReady: boolean;
  isDownloading: boolean;
  updateError: string | null;

  checkAndDownloadUpdate: () => Promise<void>;
  runUpdate: () => Promise<void>;
  skipUpdate: () => void;
};

export const useAppUpdateStore = create<AppUpdateStore>()((set) => ({
  isUpdateAvailable: false,
  isUpdateReady: false,
  isDownloading: false,
  updateError: null,

  checkAndDownloadUpdate: async () => {
    if (__DEV__) {
      return;
    }

    try {
      set({ updateError: null });
      const update = await ExpoUpdates.checkForUpdateAsync();

      if (update.isAvailable) {
        set({ isUpdateAvailable: true, isDownloading: true });

        const fetchResult = await ExpoUpdates.fetchUpdateAsync();
        if (fetchResult.isNew) {
          set({ isUpdateReady: true });
        }
        set({ isDownloading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown update error';
      logger.error('[AppUpdateStore] Check failed:', errorMessage);
      set({ updateError: errorMessage, isDownloading: false });
      return;
    }
  },

  runUpdate: async () => {
    try {
      await ExpoUpdates.reloadAsync();
    } catch (error) {
      logger.error('[AppUpdateStore] Reload failed:', error);
      return;
    }
  },

  skipUpdate: () => {
    set({ isUpdateReady: false });
  },
}));
