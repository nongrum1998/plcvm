import { Text } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@components/ui';

/** Props for {@link ChangePasswordConfirmDialog}. */
export interface ChangePasswordConfirmDialogProps {
  /** Whether the dialog is visible. Controlled by the parent. */
  open: boolean;
  /** Called on dismiss requests (backdrop tap / close). Pass the state setter. */
  onOpenChange: (open: boolean) => void;
  /** Called when the user confirms. The parent runs the password-update mutation. */
  onConfirm: () => void;
}

/**
 * Confirmation alert shown before the app updates the user's password.
 *
 * Reassures the user before a sensitive, irreversible update: once confirmed,
 * the old password is replaced and the user must log in again with the new one.
 * Renders fixed "Cancel" and "Yes, Update" actions. Side effects: none — all
 * handlers are delegated upward; the parent owns visibility state and the
 * mutation triggered by {@link ChangePasswordConfirmDialogProps.onConfirm}.
 */
export function ChangePasswordConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: ChangePasswordConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClose={() => onOpenChange(false)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Change Password?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to update your password? After confirming, you will need to use
            your new password the next time you log in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            title="Cancel"
            onPress={() => onOpenChange(false)}
            accessibilityLabel="Cancel password change"
          />
          <AlertDialogAction
            variant="destructive"
            onPress={onConfirm}
            accessibilityLabel="Confirm password change">
            <Text className="text-base font-bold text-white">Yes, Update</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
