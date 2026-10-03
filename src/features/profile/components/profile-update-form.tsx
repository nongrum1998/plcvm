import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@stores/auth.store';
import { Controller, useForm } from 'react-hook-form';
import { ProfileUpdateSchema, ProfileUpdateInput } from '../validators/profile';
import { View } from 'react-native';
import { CodeDirectories } from '@components/common/code-directories';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import {
  PAN_MAX_LENGTH,
  MOBILE_MAX_LENGTH,
  HEIGHT_MAX_LENGTH,
} from '@features/profile/utils/constants/profile-update';
import { ProfileUpdateField } from './profile-update-field';
import { formatDate2 } from '@utils/helpers/date/date-utils';

type ProfileUpdateFormProps = {
  onSubmit: (data: ProfileUpdateInput) => void;
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
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      pan_dob: __DEV__
        ? (user?.pan_dob || user?.dob) ?? '01/01/1990'
        : (user?.pan_dob || user?.dob) ?? '',
      pan_no: __DEV__ ? 'ABCDE1234F' : user?.pan_no ?? '',
      mobile_no: __DEV__ ? user?.mobile_no ?? '9876543210' : user?.mobile_no ?? '',
      height: __DEV__ ? user?.height ?? '170' : user?.height ?? '',
      comty_cd: __DEV__ ? user?.comty_cd ?? '1' : user?.comty_cd ?? '',
      marital_cd: __DEV__ ? user?.marital_cd ?? '1' : user?.marital_cd ?? '',
      religion_cd: __DEV__ ? '1' : '',
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
          <ProfileUpdateField label="Email address" error={errors.email?.message}>
            <Input
              value={value}
              onChangeText={(text) => onChange(text)}
              onBlur={onBlur}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={!!errors.email?.message}
              accessibilityLabel="Email address"
            />
          </ProfileUpdateField>
        )}
      />
      {/* Date of Birth */}
      <Controller
        control={control}
        name="pan_dob"
        render={({ field: { onChange, onBlur, value } }) => (
          <ProfileUpdateField label="Date of Birth (As on Pan)" error={errors.pan_dob?.message}>
            <Input
              value={value}
              onChangeText={(text) => onChange(formatDate2(text))}
              onBlur={onBlur}
              placeholder="DD/MM/YYYY"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              error={!!errors.pan_dob?.message}
              accessibilityLabel="Date of birth, format day slash month slash year"
            />
          </ProfileUpdateField>
        )}
      />

      {/* PAN Number */}
      <Controller
        control={control}
        name="pan_no"
        render={({ field: { onChange, onBlur, value } }) => (
          <ProfileUpdateField label="PAN Number" error={errors.pan_no?.message}>
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
          </ProfileUpdateField>
        )}
      />

      {/* Mobile Number */}
      <Controller
        control={control}
        name="mobile_no"
        render={({ field: { onChange, onBlur, value } }) => (
          <ProfileUpdateField label="Mobile Number" error={errors.mobile_no?.message}>
            <Input
              value={value}
              onChangeText={(text) => onChange(text)}
              onBlur={onBlur}
              placeholder="Enter 10-digit mobile number"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={MOBILE_MAX_LENGTH}
              error={!!errors.mobile_no?.message}
              accessibilityLabel="Mobile number, ten digits"
            />
          </ProfileUpdateField>
        )}
      />

      {/* Height */}
      <Controller
        control={control}
        name="height"
        render={({ field: { onChange, onBlur, value } }) => (
          <ProfileUpdateField label="Height (cm)" error={errors.height?.message}>
            <Input
              value={value}
              onChangeText={(text) => onChange(text)}
              onBlur={onBlur}
              placeholder="Enter height in centimetres"
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={HEIGHT_MAX_LENGTH}
              error={!!errors.height?.message}
              accessibilityLabel="Height in centimetres"
            />
          </ProfileUpdateField>
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
              error={errors.gender?.message || ''}
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
      {/* Religion */}
      <Controller
        control={control}
        name="religion_cd"
        render={({ field: { onChange, value } }) => (
          <View>
            <CodeDirectories
              selectVal={value}
              onSelect={(val) => onChange(val)}
              code="RELIGION"
              error={errors.religion_cd?.message || ''}
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
