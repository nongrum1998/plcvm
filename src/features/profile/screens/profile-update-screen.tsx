import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View, Text } from 'react-native';
import { Container } from '@components/layout';
import { Button, CodeDirectories, Ternary } from '@components';
import { Input, AlertDescription, AlertTitle, Alert, Icon } from '@components/ui';
import { useAuthStore } from '@stores/auth.store';
import { useUpdateProfile } from '../hooks/use-update-profile';
import { ProfileUpdateSchema, ProfileUpdateInput } from '../validators';
import { formatDate } from '@utils';
import z from 'zod';

/** Upper bound on characters the PAN input accepts — the length of a real PAN. */
const PAN_MAX_LENGTH = 10;

/** Indian mobile numbers are exactly ten digits. */
const MOBILE_MAX_LENGTH = 10;

/** Longest plausible height in centimetres, with room for one decimal place. */
const HEIGHT_MAX_LENGTH = 5;

/**
 * Strips a field's input down to the characters the API contract allows.
 *
 * Applied on every keystroke so the form value can never reach a state the
 * schema would reject for a character reason — the user gets a length or
 * format message instead of a confusing "invalid character" error.
 *
 * @param raw - The text as typed by the user.
 * @param pattern - A character class describing the disallowed characters.
 * @param maxLength - The maximum number of characters to keep.
 * @param transform - An optional case transform applied after filtering.
 * @returns The sanitized, length-capped string.
 */
function sanitize(
  raw: string,
  pattern: RegExp,
  maxLength: number,
  transform?: (value: string) => string
): string {
  const filtered = raw.replace(pattern, '').slice(0, maxLength);
  return transform ? transform(filtered) : filtered;
}

/**
 * The label, control and error message for a single profile field.
 *
 * Extracted because all six fields repeat the same wrapper; only the control
 * itself differs.
 */
type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

/**
 * Renders a field's uppercase label above its control and its validation error
 * below.
 */
function Field({ label, error, children }: FieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>

      {children}

      {!!error && (
        <Text className="mt-1 text-sm text-destructive" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

/**
 * Profile update form screen.
 *
 * Edits the six fields the `update_profile` endpoint accepts — date of birth,
 * PAN number, mobile number, height, community and marital status. Community
 * and marital status are picked from the option lists in
 * `../utils/constants/profile-options` and submitted as codes, not labels.
 *
 * Date of birth is prefilled from `useAuthStore.user.dob`; the other five have
 * no counterpart on `UserT` and start empty.
 *
 * The success banner sits above the form rather than replacing it, so a
 * mis-entered value can be corrected without navigating away.
 *
 * @returns The rendered profile update screen.
 */

const ProfileSchema = ProfileUpdateSchema.omit({ image: true });

type ProfileInput = z.infer<typeof ProfileSchema>;

export function ProfileUpdateScreen() {
  const user = useAuthStore((s) => s.user);
  const { mutate, isPending, data, isSuccess } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      pan_dob: (user?.pan_dob || user?.dob) ?? '',
      pan_no: user?.pan_no ?? '',
      mobile_no: user?.mobile_no ?? '',
      height: user?.height ?? '',
      comty_cd: user?.comty_cd ?? '',
      marital_cd: user?.marital_cd ?? '',
      gender: user?.gender,
      email: user?.email,
    },
  });

  const onSubmit = (data: ProfileInput) =>
    mutate({
      ...data,
      image: '',
    });

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

        <View className="gap-4 rounded-md border border-gray-200/80 bg-card p-5">
          {/* API Error */}
          <Ternary
            condition={isSuccess && data?.success}
            ifTrue={
              <Alert>
                <View className="flex-1">
                  <AlertTitle className="text-sm">Successfully</AlertTitle>
                  <AlertDescription>{data?.message}</AlertDescription>
                </View>
              </Alert>
            }
            ifFalse={
              <Ternary
                condition={isSuccess && !data.success}
                ifFalse={null}
                ifTrue={
                  <Alert variant="destructive">
                    <Icon name="alert-circle" size={18} className="mt-0.5 text-destructive" />
                    <View className="flex-1">
                      <AlertTitle className="text-sm">Failed to Update</AlertTitle>
                      <AlertDescription>{data?.message}</AlertDescription>
                    </View>
                  </Alert>
                }
              />
            }
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field label="Email address" error={errors.email?.message}>
                <Input
                  value={value}
                  onChangeText={(text) => onChange(text)}
                  onBlur={onBlur}
                  placeholder="DD/MM/YYYY"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!errors.pan_dob?.message}
                  accessibilityLabel="Date of birth, format day slash month slash year"
                />
              </Field>
            )}
          />
          {/* Date of Birth */}
          <Controller
            control={control}
            name="pan_dob"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field label="Date of Birth (As on Pan)" error={errors.pan_dob?.message}>
                <Input
                  value={value}
                  onChangeText={(text) => onChange(formatDate(text))}
                  onBlur={onBlur}
                  placeholder="DD/MM/YYYY"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!errors.pan_dob?.message}
                  accessibilityLabel="Date of birth, format day slash month slash year"
                />
              </Field>
            )}
          />

          {/* PAN Number */}
          <Controller
            control={control}
            name="pan_no"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field label="PAN Number" error={errors.pan_no?.message}>
                <Input
                  value={value}
                  onChangeText={(t) => onChange(t)}
                  onBlur={onBlur}
                  placeholder="ABCDE1234F"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={PAN_MAX_LENGTH}
                  error={!!errors.pan_no?.message}
                  accessibilityLabel="PAN number, five letters four digits one letter"
                />
              </Field>
            )}
          />

          {/* Mobile Number */}
          <Controller
            control={control}
            name="mobile_no"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field label="Mobile Number" error={errors.mobile_no?.message}>
                <Input
                  value={value}
                  onChangeText={(text) => onChange(sanitize(text, /\D/g, MOBILE_MAX_LENGTH))}
                  onBlur={onBlur}
                  placeholder="Enter 10-digit mobile number"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={MOBILE_MAX_LENGTH}
                  error={!!errors.mobile_no?.message}
                  accessibilityLabel="Mobile number, ten digits"
                />
              </Field>
            )}
          />

          {/* Height */}
          <Controller
            control={control}
            name="height"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field label="Height (cm)" error={errors.height?.message}>
                <Input
                  value={value}
                  onChangeText={(text) =>
                    onChange(
                      sanitize(text, /[^\d.]/g, HEIGHT_MAX_LENGTH).replace(/(\..*)\./g, '$1')
                    )
                  }
                  onBlur={onBlur}
                  placeholder="Enter height in centimetres"
                  keyboardType="decimal-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={HEIGHT_MAX_LENGTH}
                  error={!!errors.height?.message}
                  accessibilityLabel="Height in centimetres"
                />
              </Field>
            )}
          />

          {/* Community */}

          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View>
                <CodeDirectories
                  selectVal={value}
                  onSelect={(val) => onChange(val)}
                  code="GENDER"
                  error={errors.comty_cd?.message || ''}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="comty_cd"
            render={({ field: { onChange, value } }) => (
              <View>
                <CodeDirectories
                  selectVal={value}
                  onSelect={(val) => onChange(val)}
                  code="COMMUNITY"
                  error={errors.comty_cd?.message || ''}
                />
              </View>
            )}
          />

          {/* Marital Status */}
          <Controller
            control={control}
            name="religion_cd"
            render={({ field: { onChange, value } }) => (
              <View>
                <CodeDirectories
                  selectVal={value}
                  onSelect={(val) => onChange(val)}
                  code="RELIGION"
                  error={errors.marital_cd?.message || ''}
                />
              </View>
            )}
          />
          <Controller
            control={control}
            name="marital_cd"
            render={({ field: { onChange, value } }) => (
              <View>
                <CodeDirectories
                  selectVal={value}
                  onSelect={(val) => onChange(val)}
                  code="MARITAL"
                  error={errors.marital_cd?.message || ''}
                />
              </View>
            )}
          />

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
      </View>
    </Container>
  );
}
