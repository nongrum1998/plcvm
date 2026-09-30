import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '@components';
import { Container } from '@components/layout';
import { FooterImg } from '@components/common';
import { useAuthStore } from '@stores/auth.store';
import type { DeclarationAnswer } from '../types';

/** Props for {@link FaceVerificationDeclarationForm}. */
export interface FaceVerificationDeclarationFormProps {
  /** Answer for the non-employment question. */
  nec: DeclarationAnswer;
  /** Answer for the re-marriage question. */
  nmc: DeclarationAnswer;
  /** Called when the user answers the non-employment question. */
  onNecChange: (value: DeclarationAnswer) => void;
  /** Called when the user answers the re-marriage question. */
  onNmcChange: (value: DeclarationAnswer) => void;
  /** Called when the user presses the Scan Face button. */
  onSubmit: () => void;
}

/**
 * Renders the controlled DLC declaration form for the current user.
 *
 * The component only presents the supplied answers and reports literal `0` or
 * `1` selections to its parent. Permission, status queries, mutations, and
 * phase transitions remain the screen's responsibility. Missing or unexpected
 * runtime values are displayed as `0` (No) so the form always has a safe
 * selection.
 */
export function FaceVerificationDeclarationForm({
  nec = '0',
  nmc = '0',
  onNecChange,
  onNmcChange,
  onSubmit,
}: FaceVerificationDeclarationFormProps) {
  const { user } = useAuthStore();
  const showMarriageQuestion = user?.pclass === 'f';
  const selectedNec: DeclarationAnswer = nec === '1' ? '1' : '0';
  const selectedNmc: DeclarationAnswer = nmc === '1' ? '1' : '0';

  const isNecNo = selectedNec === '0';
  const isNecYes = selectedNec === '1';

  const isNmcNo = selectedNmc === '0';
  const isNmcYes = selectedNmc === '1';

  return (
    <Container className="gap-5">
      <View className="gap-2">
        <View className="bg-primary/10 self-start py-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-primary">
            Employement / Marriage
          </Text>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Self-Declaration
        </Text>

        <Text className="text-sm font-medium text-muted-foreground">
          Please answer the questions below.
        </Text>
      </View>

      <View className="w-full gap-y-2 rounded-md border-gray-500 bg-muted p-4">
        {/* Employment Section */}
        <Text className="text-center font-bold text-primary">EMPLOYMENT STATUS</Text>
        <View className="mb-4 flex-row items-center justify-between rounded-md border border-border bg-background p-3">
          <Text className="flex-1 pr-2 text-sm font-bold text-foreground">
            Are you Re-Employed?
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNecChange('1')}
              className="flex-row items-center gap-1.5 px-2 py-1">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  isNecYes ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                }`}>
                {isNecYes && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <Text className="text-sm font-bold text-foreground">Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNecChange('0')}
              className="flex-row items-center gap-1.5 px-2 py-1">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  isNecNo ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                }`}>
                {isNecNo && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <Text className="text-sm font-bold text-foreground">No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Marriage / Re-Marriage Section */}
        {showMarriageQuestion && (
          <>
            <Text className="mt-2 text-center font-bold text-primary">MARITAL STATUS</Text>
            <View className="mb-4 flex-row items-center justify-between rounded-md border border-border bg-background p-3">
              <Text className="flex-1 pr-2 text-sm font-bold text-foreground">
                Are you Re-Married?
              </Text>

              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onNmcChange('1')}
                  className="flex-row items-center gap-1.5 px-2 py-1">
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isNmcYes ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                    }`}>
                    {isNmcYes && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </View>
                  <Text className="text-sm font-bold text-foreground">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onNmcChange('0')}
                  className="flex-row items-center gap-1.5 px-2 py-1">
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isNmcNo ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                    }`}>
                    {isNmcNo && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </View>
                  <Text className="text-sm font-bold text-foreground">No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <Button size="lg" className="mt-3 w-full" onPress={onSubmit}>
          <Text className="text-base font-bold text-white">Scan Face</Text>
        </Button>
      </View>
      <FooterImg />
    </Container>
  );
}
