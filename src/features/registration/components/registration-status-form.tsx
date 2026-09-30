import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { RegistrationStatusInput, RegistrationStatusSchema } from '../validators';
import { View, Text } from 'react-native';
import { Button, Icon } from '@components';
import { useCheckPPO } from '../hooks';
import { Input } from '@components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { cn } from '@utils';

const defaultValues = {
  // DEV-ONLY prefill; EXPO_PUBLIC_PPO_NO inlines into the bundle at build time.
  ppo_no: process.env.EXPO_PUBLIC_PPO_NO,
};

export const RegistrationStatusForm = () => {
  const { mutate, isPending, data, isSuccess } = useCheckPPO();

  const form = useForm<RegistrationStatusInput>({
    resolver: zodResolver(RegistrationStatusSchema),
    // Seed from the store so navigating Back to this step preserves the
    // previously entered PPO number (forms remount per step).
    defaultValues,
  });

  const onSubmit = (data: RegistrationStatusInput) => mutate(data);

  return (
    <View className="w-full gap-4 py-2">
      {isSuccess && (
        <Alert variant={data.success ? 'success' : 'destructive'}>
          <Icon
            name="info"
            size={18}
            className={cn('mt-0.5', data.success ? 'text-green-500' : 'text-destructive')}
          />
          <View className="flex-1">
            <AlertTitle>{data.success ? 'PPO Status Success' : 'PPO Status Error'}</AlertTitle>
            <AlertDescription>{data?.message}</AlertDescription>
          </View>
        </Alert>
      )}
      <Controller
        control={form.control}
        name="ppo_no"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-base font-semibold text-gray-700">PPO Number</Text>
              <Text className="mb-1.5 text-base font-semibold text-destructive">*</Text>
            </View>
            <Input
              value={value}
              onChangeText={(v) => {
                return onChange(v);
              }}
              onBlur={onBlur}
              placeholder="Enter your PPO Number"
              autoCapitalize="characters"
              autoCorrect={false}
              className="text-base"
              accessibilityLabel="PPO Number"
              error={!!form.formState.errors.ppo_no}
            />
            {form.formState.errors.ppo_no && (
              <Text
                className="mt-1 text-base font-medium text-destructive"
                accessibilityLiveRegion="polite">
                {form.formState.errors.ppo_no.message}
              </Text>
            )}
          </View>
        )}
      />
      <Button
        isLoading={isPending}
        size="lg"
        disabled={isPending}
        onPress={form.handleSubmit(onSubmit)}>
        Check PPO Status
      </Button>
    </View>
  );
};
