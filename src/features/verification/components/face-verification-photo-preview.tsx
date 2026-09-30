import { Text, Image, View } from 'react-native';
import { Button } from '@components';
import { Container } from '@components/layout';
import { FooterImg } from '@components/common';
import type { DlcDeclarationDetails } from '../types';

/** Props for {@link FaceVerificationPhotoPreviewStep}. */
export interface FaceVerificationPhotoPreviewStepProps {
  /** Data URI of the captured photo; empty string hides the image. */
  previewUri: string;
  /** Declaration answers that will be sent with the captured image. */
  declaration: DlcDeclarationDetails;
  /** Whether the marriage declaration should be included in the summary. */
  showMarriageQuestion: boolean;
  /** Called by the action button; parent decides the next step. */
  onSubmitPress: () => void;
  /** Label for the action button; defaults to "Submit Photo". */
  actionLabel?: string;
  /** Called when the user chooses to discard the captured preview. */
  onReset: () => void;
}

/**
 * Displays the captured face image and the exact declaration values before
 * the parent opens the submission confirmation.
 *
 * The component formats declaration values for display only: `0` is shown as
 * No and `1` as Yes. It does not make a request, navigate, capture an image, or
 * alter the values supplied by the screen.
 */
export function FaceVerificationPhotoPreviewStep({
  previewUri,
  declaration,
  showMarriageQuestion,
  onSubmitPress,
  actionLabel = 'Submit Photo',
  onReset,
}: FaceVerificationPhotoPreviewStepProps) {
  const formatAnswer = (answer: DlcDeclarationDetails['nec']) => (answer === '1' ? 'Yes' : 'No');

  return (
    <Container className="gap-5">
      {previewUri ? (
        <View className="items-center">
          <Image
            accessible
            accessibilityLabel="Captured face preview"
            source={{ uri: previewUri }}
            className="h-64 w-56 rounded-md border border-primary"
          />
        </View>
      ) : null}

      <View className="gap-3 rounded-md border border-border bg-muted p-4">
        <Text className="text-center font-bold text-primary">DECLARATION SUMMARY</Text>
        <View className="flex-row items-center justify-between gap-4">
          <Text className="text-sm font-medium text-foreground">Re-employed</Text>
          <Text className="text-sm font-bold text-foreground">{formatAnswer(declaration.nec)}</Text>
        </View>
        {showMarriageQuestion ? (
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-sm font-medium text-foreground">Re-married</Text>
            <Text className="text-sm font-bold text-foreground">
              {formatAnswer(declaration.nmc)}
            </Text>
          </View>
        ) : null}
      </View>

      <Text className="mt-4 text-center text-sm text-foreground">
        This photo is required for the system to verify your Authenticity.
      </Text>
      <Text className="mt-2 text-center text-sm text-foreground">
        Please make sure that it is your photograph. Before submitting the photo, please read Our
        Privacy Policy.
      </Text>
      <Text className="mt-2 text-center text-sm font-bold text-destructive">
        [Note: The photo {`won't`} be used for any other purpose except for authenticating your
        Identity for Pension.]
      </Text>
      <Button size="lg" className="mt-6" onPress={onSubmitPress}>
        <Text className="text-base font-bold text-white">{actionLabel}</Text>
      </Button>
      <Button variant={'outline'} size="lg" onPress={onReset}>
        Reset
      </Button>
      <FooterImg />
    </Container>
  );
}
