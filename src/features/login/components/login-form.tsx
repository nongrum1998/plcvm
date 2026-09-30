import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoginInput, LoginSchema } from '../validators';
import { useLogin } from '../hooks/use-login';
import { Input } from '@components/ui/input';
import { Button, Icon } from '@components';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { useNetworkStatus } from '@hooks';

const defaultValues = {
  // DEV-ONLY convenience prefill. EXPO_PUBLIC_PPO_NO is compiled into the JS
  // bundle, so it must NEVER be set in a production/EAS build. Leave unset for
  // release builds.
  username: __DEV__ ? process.env.EXPO_PUBLIC_PPO_NO : '',
  // Password is NEVER defaulted from an env var: EXPO_PUBLIC_* values ship in
  // the client bundle, which would embed a working credential in the binary.
  password: __DEV__ ? process.env.EXPO_PUBLIC_PASSWORD : '',
};

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending, isSuccess, data } = useLogin();
  const { isOffline } = useNetworkStatus();

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues,
  });

  const onSubmit = async (data: LoginInput) => {
    await mutateAsync(data);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <View className="w-full gap-2 py-2">
      {isSuccess && !data.success && (
        <Alert testID="login-error-alert" variant="destructive">
          <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />
          <View className="flex-1">
            <AlertTitle className="text-sm">Login Error!</AlertTitle>
            <AlertDescription>{data?.message}</AlertDescription>
          </View>
        </Alert>
      )}

      <Controller
        control={form.control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <View className="flex-row gap-1">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">Username</Text>
              <Text className="mb-1.5 text-sm font-medium text-destructive">*</Text>
            </View>
            <Input
              testID="login-username"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your PPO No."
              readOnly={isOffline}
              autoCapitalize="none"
              autoCorrect={false}
              error={!!form.formState.errors.username}
            />
            {form.formState.errors.username && (
              <Text testID="login-error-username" className="mt-1 text-xs text-destructive">
                {form.formState.errors.username.message}
              </Text>
            )}
          </View>
        )}
      />
      {/* Password Field */}
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
                readOnly={isOffline}
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
      {/* Submit Button */}
      <Button
        testID="login-submit"
        isLoading={isPending}
        size="lg"
        disabled={isPending || isOffline}
        onPress={form.handleSubmit(onSubmit)}
        className="w-full">
        Submit
      </Button>
    </View>
  );
};
