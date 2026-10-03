import { Text, View } from 'react-native';
import { useEffect } from 'react';
import { RegistrationCamera } from '../components/registration-camera';
import { RegistrationForm } from '../components/registration-form';
import { RegistrationStatusForm } from '../components/registration-status-form';
import { RegistrationStepHeader } from '../components/registration-step-header';
import { RegistrationSuccessView } from '../components/registration-success-view';

import { Container } from '@components/layout/container';
import { useRegistrationStore } from '../store/registration';
import { RegistrationErrorView } from '../components/registration-error-view';
import { useRegisterPensioner } from '../hooks/use-registrer-pensioner';
import { LoadingScreen } from '@components/screens/loading-screen';
import { RegisterPensionerInput } from '../validators/registration';

/**
 * Three-step pensioner registration wizard shell.
 *
 * Renders a large-print step header with progress bar and the active step
 * form. Content is top-aligned so the keyboard cannot shift layout.
 *
 * Step 1 checks the PPO number, step 2 collects details (DOB, bank account,
 * password), and step 3 captures a liveness face photo and submits
 * automatically. Step 3 bypasses the scroll container entirely and renders
 * {@link RegistrationCamera} full-bleed: inside a ScrollView's content the
 * camera's absolutely-positioned preview has no intrinsic height, so its
 * flex wrappers collapse to zero and the preview stays invisible.
 *
 * After a successful submit, the entire step content (header, form, footer)
 * is replaced by the success view, which resets the wizard and returns the
 * user to login.
 *
 * @returns The rendered registration screen.
 */
export default function RegistrationScreen() {
  const { step, reset } = useRegistrationStore();
  const { mutate, data, isPending, isSuccess } = useRegisterPensioner();

  const onSubmit = (value: RegisterPensionerInput) => mutate(value);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  if (isPending) {
    return <LoadingScreen message="Registering Pensioner" />;
  }

  if (isSuccess && !data?.success) {
    return (
      <Container className="flex-1 gap-5">
        <View className="gap-2">
          <View className="bg-primary/10 self-start py-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">Error</Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            Registration
          </Text>
          <Text className="text-sm font-medium text-muted-foreground">Something when wrong</Text>
        </View>
        <View className="mt-6 w-full">
          <RegistrationErrorView message={data?.message} />
        </View>
      </Container>
    );
  }

  if (isSuccess && data.success) {
    return (
      <Container className="flex-1 gap-5">
        <View className="gap-2">
          <View className="bg-primary/10 self-start py-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">Success</Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            Registration
          </Text>

          <Text className="text-sm font-medium text-muted-foreground">
            Your registration was successful. You can now log in with your details.
          </Text>
        </View>
        <View className="mt-6 w-full">
          <RegistrationSuccessView message={data.message} />
        </View>
      </Container>
    );
  }

  // Step 3 renders outside the Container so the camera gets a definite
  // height (see the doc comment above).
  if (step === 3) {
    return <RegistrationCamera onSubmit={onSubmit} />;
  }

  return (
    <Container className="flex-1 gap-5 py-10">
      {/* Step X of 3 + progress bar + title + instruction */}
      <RegistrationStepHeader step={step} />

      {/* Active step form */}
      <View className="mt-6">
        {step === 1 && <RegistrationStatusForm />}
        {step === 2 && <RegistrationForm />}
      </View>
    </Container>
  );
}
