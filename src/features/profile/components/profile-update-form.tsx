import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@stores/auth.store';
import { Controller, FormState, useForm } from 'react-hook-form';
import { ProfileUpdateSchema } from '../validators';
import { z } from 'zod';
import { View, Text } from 'react-native';
import { CodeDirectories, Input, Button } from '@components';
import { formatDate } from '@utils';

/** Upper bound on characters the PAN input accepts — the length of a real PAN. */
const PAN_MAX_LENGTH = 10;

/** Indian mobile numbers are exactly ten digits. */
const MOBILE_MAX_LENGTH = 10;

/** Longest plausible height in centimetres, with room for one decimal place. */
const HEIGHT_MAX_LENGTH = 5;

function sanitize(
  raw: string,
  pattern: RegExp,
  maxLength: number,
  transform?: (value: string) => string
): string {
  const filtered = raw.replace(pattern, '').slice(0, maxLength);
  return transform ? transform(filtered) : filtered;
}

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

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

const ProfileSchema = ProfileUpdateSchema.omit({ image: true });

type ProfileInput = z.infer<typeof ProfileSchema>;

type ProfileUpdateFormProps = {
  onSubmit: (data: ProfileInput) => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export const ProfileUpdateForm = ({
  onSubmit,
  isLoading = false,
  disabled = false,
}: ProfileUpdateFormProps) => {
  const user = useAuthStore((s) => s.user);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      pan_dob: __DEV__
        ? (user?.pan_dob || user?.dob) ?? '01/01/1990'
        : (user?.pan_dob || user?.dob) ?? '',
      pan_no: __DEV__ ? 'ABCDE1234F' : user?.pan_no ?? '',
      mobile_no: __DEV__ ? user?.mobile_no ?? '9876543210' : user?.mobile_no ?? '',
      height: __DEV__ ? user?.height ?? '170' : user?.height ?? '',
      comty_cd: __DEV__ ? user?.comty_cd ?? '1' : user?.comty_cd ?? '',
      marital_cd: __DEV__ ? user?.marital_cd ?? '1' : user?.marital_cd ?? '',
      gender: __DEV__ ? user?.gender ?? 'M' : user?.gender,
      email: __DEV__ ? user?.email ?? 'test@example.com' : user?.email,
    },
  });
  return (
    <View className="gap-y-4">
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
                onChange(sanitize(text, /[^\d.]/g, HEIGHT_MAX_LENGTH).replace(/(\..*)\./g, '$1'))
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
        render={({ field: { onChange, value }, fieldState }) => (
          <View>
            <CodeDirectories
              selectVal={value}
              onSelect={(val) => onChange(val)}
              code="MARITAL"
              error={fieldState.error?.message ? fieldState.error.message : ''}
            />
          </View>
        )}
      />

      {/* Submit */}
      <Button
        size="lg"
        onPress={handleSubmit(onSubmit)}
        disabled={disabled}
        isLoading={isLoading}
        activeOpacity={0.8}>
        Save Changes
      </Button>
    </View>
  );
};
