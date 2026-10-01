import { View, Text } from 'react-native';
import { Container } from '@components/layout';
import { useUpdateProfile } from '../hooks/use-update-profile';
import { ProfileUpdateForm } from '../components';
import { ProfileUpdateCamera } from '../components/profile-update-camera';
import { useState } from 'react';
import { ProfileUpdateInput } from '../validators';
import { ProfileUpdateResultView } from '../components/profile-update-result';

type CameraPhase = 'camera' | 'capturing' | 'submitting' | 'error';

type PhaseT = 'result' | 'camera' | 'form';

export function ProfileUpdateScreen() {
  const { isPending, mutate, data, isSuccess } = useUpdateProfile();
  const [formData, setFormData] = useState<Omit<ProfileUpdateInput, 'image'> | null>(null);
  const [phase, setPhase] = useState<PhaseT>('form');
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('camera');

  const onSubmitForm = (data: Omit<ProfileUpdateInput, 'image'>) => {
    setPhase('camera');
    setFormData(data);
  };

  const onSubmit = (base64: string) => {
    if (phase === 'camera' && base64 && formData) {
      setCameraPhase('submitting');
      const payload = {
        ...formData,
        image: base64,
      };
      mutate(payload, { onSuccess: () => setPhase('result') });
    }
  };
  const onReset = () => {
    setPhase('form');
    setCameraPhase('camera');
    setFormData(null);
  };

  if (phase === 'camera') {
    return (
      <ProfileUpdateCamera
        onSubmit={(data) => onSubmit(data)}
        phase={cameraPhase}
        onPhaseChange={(phase) => setCameraPhase(phase)}
        onReset={onReset}
      />
    );
  }

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

        {phase === 'result' && isSuccess && (
          <ProfileUpdateResultView
            onBack={onReset}
            message={data?.message || ''}
            success={data?.success || false}
          />
        )}

        {phase === 'form' && (
          <View className="gap-4 rounded-md border border-gray-200/80 bg-card p-5">
            {/* API Error */}
            <ProfileUpdateForm
              onSubmit={(v) => onSubmitForm(v)}
              isLoading={isPending}
              disabled={isPending}
            />
          </View>
        )}
      </View>
    </Container>
  );
}
