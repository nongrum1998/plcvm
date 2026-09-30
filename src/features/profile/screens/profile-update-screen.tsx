import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View, Text } from 'react-native';
import { Container } from '@components/layout';
import { Button } from '@components';
import { Input } from '@components/ui';
import { useAuthStore } from '@stores/auth.store';
import { useUpdateProfile } from '../hooks/use-update-profile';
import { ProfileUpdateSchema, ProfileUpdateInput } from '../validators';

/**
 * Profile update form screen.
 *
 * Pre-fills the editable `name`/`username` fields from `useAuthStore.user` and
 * submits changes via `useUpdateProfile`. Shows an inline error banner on
 * failure and a success summary on success.
 */
export function ProfileUpdateScreen() {
  const user = useAuthStore((s) => s.user);
  const { mutate, isPending, isError, error, isSuccess } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: user?.pname ?? '',
      username: user?.ppo_no ?? '',
    },
  });

  const onSubmit = (data: ProfileUpdateInput) => {
    const parsed = ProfileUpdateSchema.safeParse(data);
    if (parsed.success) mutate(data);
  };

  return (
    <Container scrollable>
      <View className="w-full gap-5">
        {/* Header */}
        <View className="gap-2">
          <View className="bg-primary/10 self-start py-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">Account</Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            Update Profile
          </Text>

          <Text className="text-sm font-medium text-muted-foreground">
            Update your profile details below.
          </Text>
        </View>

        {isSuccess ? (
          /* Success */
          <View className="my-4 items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <Text className="text-center text-base font-bold text-emerald-950">
              Profile Updated
            </Text>

            <Text className="text-center text-xs leading-5 text-emerald-800">
              Your profile has been updated.
            </Text>
          </View>
        ) : (
          /* Form */
          <View className="gap-4 rounded-md border border-gray-200/80 bg-card p-5">
            {/* API Error */}
            {isError && (
              <View className="border-destructive/30 bg-destructive/10 rounded-xl border p-3">
                <Text className="text-center text-xs font-semibold text-destructive">
                  {error?.message || 'Failed to update profile. Please try again.'}
                </Text>
              </View>
            )}

            {/* Name */}
            <View className="gap-1.5">
              <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Name
              </Text>

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter your name"
                      error={!!errors.name?.message}
                      autoCapitalize="words"
                    />

                    {errors.name && (
                      <Text className="mt-1 text-sm text-destructive">{errors.name.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Organization
              </Text>

              <Controller
                control={control}
                name="organization"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter your organization"
                      error={!!errors.organization?.message}
                      autoCapitalize="none"
                    />

                    {errors.organization && (
                      <Text className="mt-1 text-sm text-destructive">
                        {errors.organization.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
            {/* Username */}
            <View className="gap-1.5">
              <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Username
              </Text>

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter your username"
                      error={!!errors.username?.message}
                      autoCapitalize="none"
                    />

                    {errors.username && (
                      <Text className="mt-1 text-sm text-destructive">
                        {errors.username.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Submit */}
            <Button
              size="lg"
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              isLoading={isPending}
              activeOpacity={0.8}>
              Save Changes
            </Button>
          </View>
        )}
      </View>
    </Container>
  );
}
