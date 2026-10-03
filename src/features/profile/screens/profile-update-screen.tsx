import { View, Text } from 'react-native';
import { Container } from '@components/layout/container';
import { useUpdateProfile } from '../hooks/use-update-profile';
import { ProfileUpdateForm } from '../components/profile-update-form';
import type { CameraPhase } from '@components/common/face-capture-camera-view';
import { ProfileUpdateCamera } from '../components/profile-update-camera';
import { useState } from 'react';
import { ProfileUpdateInput } from '../validators/profile';
import { ProfileUpdateResultView } from '../components/profile-update-result';

/**
 * The three top-level steps of the profile update flow.
 *
 * - `form` — the editable form is visible.
 * - `camera` — face capture must complete before anything can be submitted;
 *   the form is unmounted and its values are held in local state.
 * - `result` — the mutation settled and the envelope-driven result card shows.
 */
type ProfileUpdatePhaseT = 'result' | 'camera' | 'form';

/**
 * Profile update screen: a three-step form → face capture → result flow.
 *
 * Step 1 (`form`) renders {@link ProfileUpdateForm}, whose zod resolver
 * (`ProfileUpdateSchema`) validates the input before `onSubmitForm` runs. Valid
 * values are stashed in local state and the phase advances to `camera`.
 *
 * Step 2 (`camera`) renders {@link ProfileUpdateCamera} and owns a second,
 * nested {@link CameraPhase} state machine (`camera` | `capturing` |
 * `submitting` | `error`) driven by `FaceCaptureCameraView`. Face capture is a
 * hard interlock: `onSubmit` only fires the mutation once a base64 image
 * arrives, and it merges that image into the stashed form values, so there is
 * no path that submits the profile without a capture.
 *
 * Step 3 (`result`) renders {@link ProfileUpdateResultView}, which selects
 * `SuccessStatusCard` or `RejectStatusCard` from the envelope's `success` flag.
 *
 * Failure handling is worth noting: `http.post` never rejects, so react-query's
 * `isSuccess` means only that the request completed — not that the update was
 * accepted. A 404 or 500 therefore still advances to `result` and renders as a
 * rejection via `data.success`, which is the intended behaviour. `onReset`
 * clears the phase, the camera phase and the stashed values, and backs both
 * the result card's "Go Back"/"Try Again" and the camera's own reset.
 *
 * The result card renders inside the same `Container` as the form, so the
 * "Account / Update Profile" header stays visible across all three phases. The
 * form itself is mounted only in the `form` phase, which means its `isPending`
 * and `disabled` props are effectively always `false` while it is on screen —
 * the mutation runs during the `camera` phase.
 *
 * @returns The profile update screen for the current phase.
 */
export function ProfileUpdateScreen() {
  const { isPending, mutate, data, isSuccess } = useUpdateProfile();
  const [formData, setFormData] = useState<Omit<ProfileUpdateInput, 'image'> | null>(null);
  const [phase, setPhase] = useState<ProfileUpdatePhaseT>('form');
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('camera');

  const onSubmitForm = (data: Omit<ProfileUpdateInput, 'image'>) => {
    setPhase('camera');
    setFormData(data);
  };

  const onSubmit = (base64: string) => {
    setCameraPhase('submitting');
    if (phase === 'camera' && base64 && formData) {
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
            {/* Form — mounted only in the `form` phase */}
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
