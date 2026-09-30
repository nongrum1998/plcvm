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

/** Props for {@link FaceVerificationConfirmDialog}. */
export interface FaceVerificationConfirmDialogProps {
  /** Whether the dialog is visible. Controlled by the parent. */
  open: boolean;
  /** Called on dismiss requests (backdrop tap / close). Pass the state setter. */
  onOpenChange: (open: boolean) => void;
  /** Dialog heading text. */
  title: string;
  /** Body text; `\n` line breaks render literally. */
  description: string;
  /** When true, the title renders in the destructive color (e.g. T&C warning). */
  destructive?: boolean;
  /** Called when the user confirms with "Yes". Parent closes the dialog itself. */
  onConfirm: () => void;
}

/**
 * Reusable Yes/No confirmation alert for the face-verification flow.
 * Renders fixed "Yes" confirm and "No" cancel actions; parents own
 * visibility state and side effects. Side effects: none — all handlers
 * are delegated upward.
 */
export function FaceVerificationConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  destructive = false,
  onConfirm,
}: FaceVerificationConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClose={() => onOpenChange(false)}>
        <AlertDialogHeader>
          <AlertDialogTitle className={destructive ? 'text-destructive' : undefined}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel title="No" onPress={() => onOpenChange(false)} />
          <AlertDialogAction onPress={onConfirm}>
            <Text className="text-base font-bold text-white">Yes</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
