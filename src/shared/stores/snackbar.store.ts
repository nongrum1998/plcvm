import { create } from 'zustand';
import { type IconName } from '@components';

interface SnackbarState {
  /** The message text to display. Null means hidden. */
  message: string | null;
  /** Whether the banner is currently visible (animating in). */
  visible: boolean;
  /** Optional Hugeicons icon object (SVG path data) to display before the message. */
  icon: IconName | null;

  /**
   * Show the snackbar with the given message.
   *
   * @param message - The text to display.
   * @param icon - Optional Hugeicons icon object (e.g. CheckmarkCircle02Icon from `@hugeicons/core-free-icons`).
   */
  showSnackbar: (message: string, icon?: IconName) => void;

  /** Hide the snackbar immediately. Clears message and icon. */
  dismissSnackbar: () => void;
}

/**
 * Global snackbar state store.
 *
 * When `showSnackbar` is called, it sets the message and marks visible as true.
 * The SnackbarProvider component watches this and animates the banner in.
 * Auto-dismiss timer is managed by the provider component, not the store.
 */
export const useSnackbarStore = create<SnackbarState>((set) => ({
  message: null,
  visible: false,
  icon: null,

  showSnackbar: (message: string, icon?: IconName) =>
    set({
      message,
      icon: icon,
      visible: true,
    }),

  dismissSnackbar: () =>
    set({
      visible: false,
      message: null,
      icon: null,
    }),
}));
