import { Text, View } from 'react-native';

import { cn } from '@utils';

/** Total number of steps in the registration wizard. */
const TOTAL_STEPS = 3;

/**
 * Per-step orientation copy shown above the active form.
 *
 * Keyed by step number so the screen shell renders one header for any
 * active step; individual forms no longer carry their own titles.
 */
const STEP_CONTENT: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: 'Check Your PPO Number',
    subtitle: 'Enter your PPO Number below, then tap Check PPO Status.',
  },
  2: {
    title: 'Your Details',
    subtitle: 'Enter your date of birth and your pension bank account number.',
  },
  3: {
    title: 'Capture & Submit',
    subtitle: 'Position your face within the frame and blink to complete registration.',
  },
};

interface RegistrationStepHeaderProps {
  /** Active wizard step, 1-indexed (mirrors registration store `step`). */
  step: number;
}

/**
 * Large-print orientation header designed for elderly users.
 *
 * Renders "Step X of 3", the step title, one plain-language instruction,
 * and a segmented progress bar where filled segments equal completed or
 * active steps. All text is >=16px and uses theme tokens so dark mode
 * stays legible. The bar is decorative (`accessible={false}`); screen
 * readers get position from the "Step X of 3" text.
 *
 * The header hides entirely on the camera step (step 3) so the live view
 * gets the full screen.
 *
 * @param props - Component props.
 * @param props.step - Current step; values outside 1..3 are clamped.
 * @returns The rendered step header.
 */
export function RegistrationStepHeader({ step }: RegistrationStepHeaderProps) {
  const safeStep = Math.min(Math.max(step, 1), TOTAL_STEPS);
  const { title, subtitle } = STEP_CONTENT[safeStep];
  if (safeStep === 3) return null;

  return (
    <View className="w-full">
      <Text className="text-center text-base font-semibold uppercase tracking-widest text-primary">
        Step {safeStep} of {TOTAL_STEPS}
      </Text>
      <Text className="mt-2 text-center text-2xl font-bold text-foreground">{title}</Text>
      <Text className="mt-1.5 text-center text-base leading-relaxed text-muted-foreground">
        {subtitle}
      </Text>
      <View className="mt-5 flex-row gap-1.5" accessible={false}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            className={cn('h-2 flex-1 rounded-full', i < safeStep ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </View>
    </View>
  );
}
