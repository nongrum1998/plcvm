import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { RegisterSchema, RegisterInput } from '../validators/registration';
import { View, Text, Pressable } from 'react-native';
import { Button } from '@components/ui/button';
import { Icon } from '@components/ui/icon';
import { Input } from '@components/ui/input';
import { useRegistrationStore } from '../store/registration';
import { useState } from 'react';
import { formatDate2 } from '@utils/helpers/date/date-utils';

/**
 * Step 2 of registration: date of birth and pension bank account number.
 *
 * Senior-friendly: >=16px type throughout, numeric keypads with digit
 * sanitizing (Android IMEs can leak symbols past number-pad), a visible
 * format placeholder for DOB, and a "Back" button that PRESERVES entered
 * data instead of resetting the whole flow.
 */
const defaultValues = {
  dob: process.env.EXPO_PUBLIC_DOB,
  bank_accno: process.env.EXPO_PUBLIC_AC_NO,
  password: process.env.EXPO_PUBLIC_PASSWORD,
  confirm_password: process.env.EXPO_PUBLIC_PASSWORD,
};

const BANK_AC_NOT_MATCH_MESSAGE = 'Bank account number does not match the registered details.';
const DOB_NOT_MATCH_MESSAGE = 'Date of birth does not match the registered details.';

export const RegistrationForm = () => {
  const { nextStep, validation, prevStep, saveData, formData } = useRegistrationStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: __DEV__ ? defaultValues : { dob: formData.dob, bank_accno: formData.bank_accno },
    mode: 'all',
  });

  const onSubmit = (data: RegisterInput) => {
    const isValid = RegisterSchema.safeParse(data).success;

    if (isValid) {
      if (validation?.dob) {
        if (validation?.dob !== data.dob) {
          form.setError('dob', { message: DOB_NOT_MATCH_MESSAGE });
          return;
        }
      }

      if (validation?.bank_accno !== data.bank_accno) {
        form.setError('bank_accno', { message: BANK_AC_NOT_MATCH_MESSAGE });
        return;
      }

      saveData(data);
      nextStep();
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <View className="w-full gap-4 py-2">
      <Controller
        control={form.control}
        name="dob"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">Date of Birth</Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <Input
              value={value}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, '').slice(0, 8);
                onChange(formatDate2(digits));
              }}
              onBlur={onBlur}
              placeholder="DD-MM-YYYY"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              accessibilityLabel="Date of Birth, format year dash month dash day"
              error={!!form.formState.errors.dob}
            />

            {form.formState.errors.dob && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.dob.message}
              </Text>
            )}
            <Text className="mt-1 text-base leading-relaxed text-muted-foreground">
              Use the date of birth of the pensioner receiving the pension.
            </Text>
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="bank_accno"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">
                Bank Account Number
              </Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <Input
              value={value}
              onChangeText={(v) => onChange(v.replace(/\D/g, ''))}
              onBlur={onBlur}
              placeholder="Enter your Bank Account Number"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-base"
              accessibilityLabel="Bank Account Number"
              error={!!form.formState.errors.bank_accno}
            />
            {form.formState.errors.bank_accno && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.bank_accno.message}
              </Text>
            )}
          </View>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-6">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Password</Text>
              <Text className="mb-1.5 text-sm  font-medium text-destructive">*</Text>
            </View>
            <View className="relative justify-center">
              <Input
                testID="login-password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                error={!!form.formState.errors.password}
                className="pr-12"
              />
              <Pressable
                testID="login-toggle-password"
                onPress={togglePasswordVisibility}
                hitSlop={8}
                className="absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center p-1"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <Icon name="eye-open" /> : <Icon name="eye-close" size={20} />}
              </Pressable>
            </View>
            {form.formState.errors.password && (
              <Text testID="login-error-password" className="mt-1 text-xs text-destructive">
                {form.formState.errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="confirm_password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-6">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Confirm Password</Text>
              <Text className="mb-1.5 text-sm  font-medium text-destructive">*</Text>
            </View>
            <View className="relative justify-center">
              <Input
                testID="login-password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                error={!!form.formState.errors.confirm_password}
                className="pr-12"
              />
              <Pressable
                testID="login-toggle-password"
                onPress={togglePasswordVisibility}
                hitSlop={8}
                className="absolute right-3 top-1/2 -translate-y-1/2 items-center justify-center p-1"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <Icon name="eye-open" /> : <Icon name="eye-close" size={20} />}
              </Pressable>
            </View>
            {form.formState.errors.confirm_password && (
              <Text testID="login-error-password" className="mt-1 text-xs text-destructive">
                {form.formState.errors.confirm_password.message}
              </Text>
            )}
          </View>
        )}
      />
      <View className="gap-2">
        <View className="w-full flex-row items-center gap-3">
          {/* Previous Step Button — keeps all entered data */}
          <Button variant="outline" size="lg" onPress={prevStep} className="flex-0">
            Back
          </Button>

          {/* Next Step Button */}
          <Button
            isLoading={form.formState.isSubmitting}
            size="lg"
            // disabled={!form.formState.isValid}
            onPress={form.handleSubmit(onSubmit)}
            className="flex-1">
            Capture Face
          </Button>
        </View>
      </View>
    </View>
  );
};
