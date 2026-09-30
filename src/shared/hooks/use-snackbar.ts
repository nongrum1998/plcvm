import { useCallback } from 'react';
import { useSnackbarStore } from '@stores/snackbar.store';
import { type IconName } from '@components';

/**
 * Convenience hook for showing and dismissing the snackbar banner.
 *
 * @example
 * ```tsx
 * const { showSnackbar } = useSnackbar();
 * showSnackbar('Profile updated');
 * showSnackbar('Changes saved', CheckmarkCircle02Icon);
 * ```
 */
export const useSnackbar = () => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const dismissSnackbar = useSnackbarStore((state) => state.dismissSnackbar);

  const show = useCallback(
    (message: string, icon?: IconName) => {
      showSnackbar(message, icon);
    },
    [showSnackbar]
  );

  const dismiss = useCallback(() => {
    dismissSnackbar();
  }, [dismissSnackbar]);

  return { showSnackbar: show, dismissSnackbar: dismiss };
};
