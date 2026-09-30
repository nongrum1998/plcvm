# Registration Success / Error State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a success screen and an inline error alert to the pensioner registration Step 4 submit flow.

**Architecture:** Success state lives in the existing Zustand `useRegistrationStore` (as `isSuccess`) so the `RegistrationScreen` shell can swap the step header + form for a full success view. Error state stays local to `ConfirmRegistrationScreen` as `useState`, because the form + inline alert remain on screen for retry. The mutation result is branched on `data.success` inside react-query `onSuccess` (the `http` layer never rejects).

**Tech Stack:** React Native (Expo), TypeScript, Zustand, @tanstack/react-query, nativewind (className tokens), expo-router.

**Note:** This project has no test framework. Verification is `npm run lint` (eslint + prettier) + manual review. No TDD is applied (project has no jest/vitest config).

---

### Task 1: Add success state to the registration store

**Files:**

- Modify: `src/features/auth/store/registration.ts`

- [ ] **Step 1: Update the store to track submission success.**

  Add an `isSuccess` boolean to the store state, a `setSuccess()` action that sets it, and clear it in `reset()`. Current relevant content to preserve (do not remove existing fields/actions):

  ```ts
  interface RegistrationStore {
    step: number;
    formData: RegisterPensionerInput;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    saveData: (data: Partial<RegisterPensionerInput>) => void;
    reset: () => void;

    validation: Omit<RegisterPensionerInput, 'ppo_no' | 'password'> | null;
    setValidationData: (data: Omit<RegisterPensionerInput, 'ppo_no' | 'password'>) => void;

    isSuccess: boolean;
    setSuccess: () => void;
  }

  export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
    step: 1,
    formData: defaultValue,
    validation: null,
    isSuccess: false,
    setValidationData: (data) => set({ validation: data }),

    setStep: (step) => set({ step }),
    nextStep: () => {
      if (get().step < 4) {
        set((state) => ({ step: state.step + 1 }));
      }
    },
    prevStep: () => {
      if (get().step > 1) {
        set((state) => ({ step: state.step - 1 }));
      }
    },

    saveData: (data) =>
      set((state) => ({
        formData: { ...state.formData, ...data },
      })),

    setSuccess: () => set({ isSuccess: true }),

    reset: () => set({ step: 1, formData: defaultValue, isSuccess: false }),
  }));
  ```

- [ ] **Step 2: Lint + type check.**

  Run: `npm run lint`
  Expected: no errors on `src/features/auth/store/registration.ts`.

- [ ] **Step 3: Commit.**

  ```bash
  git add src/features/auth/store/registration.ts
  git commit -m "feat: add isSuccess state to registration store"
  ```

---

### Task 2: Create the RegistrationSuccessView component

**Files:**

- Create: `src/features/auth/components/registration-success-view.tsx`
- Modify: `src/features/auth/components/index.ts` (barrel export)

- [ ] **Step 1: Create the success view component.**

  Full emerald success card (styled after `SuccessStatusCard`) with a "Go to Login" button that resets the wizard and navigates to `/auth`. Content is top-aligned and centered for elderly-friendly large print.

  ```tsx
  import { Text, View } from 'react-native';
  import { router } from 'expo-router';
  import { Button } from '@components/ui/button';
  import { useRegistrationStore } from '../store/registration';
  import { PAGE_ROUTES } from '@utils/constants';

  /**
   * Full-screen success state shown after a successful registration submit.
   *
   * Replaces the entire Step 4 content (header, form, footer). Renders an
   * emerald confirmation card and a "Go to Login" button that resets the
   * registration wizard before navigating to the login route.
   *
   * @returns The rendered success view.
   */
  export function RegistrationSuccessView() {
    const reset = useRegistrationStore((state) => state.reset);

    const handleDone = () => {
      reset();
      router.push(PAGE_ROUTES.AUTH.HOME);
    };

    return (
      <View className="w-full gap-y-5">
        <View className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
              <Text className="text-lg font-black text-white">✓</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-emerald-900">Registration Successful</Text>
              <Text className="text-sm font-semibold text-emerald-700">
                Your account has been created
              </Text>
            </View>
          </View>

          <View className="h-[1px] w-full bg-emerald-500/20" />

          <Text className="text-center text-lg font-medium leading-relaxed text-emerald-950/80">
            You can now log in with your PPO Number and the password you just created.
          </Text>
          <Button size="lg" onPress={handleDone} className="mt-2 w-full">
            Go to Login
          </Button>
        </View>
      </View>
    );
  }
  ```

- [ ] **Step 2: Barrel-export the new component.**

  In `src/features/auth/components/index.ts`, add:

  ```ts
  export * from './registration-success-view';
  ```

- [ ] **Step 3: Lint.**

  Run: `npm run lint`
  Expected: no errors on the two files.

- [ ] **Step 4: Commit.**

  ```bash
  git add src/features/auth/components/registration-success-view.tsx src/features/auth/components/index.ts
  git commit -m "feat: add registration success view component"
  ```

---

### Task 3: Wire success/error handling into ConfirmRegistrationScreen

**Files:**

- Modify: `src/features/auth/components/confirm-registration.tsx`

- [ ] **Step 1: Add error state + branch the mutation result (preserve the confirmation dialog).**

  The current submit is a **two-step flow**: `Submit` → `handleSubmitClick` (validation) → opens `RegistrationConfirmDialog` → `handleDialogConfirm` fires `register(...)`. **Keep this dialog flow intact** — do not remove `RegistrationConfirmDialog`, `isConfirmOpen`, `handleSubmitClick`, or `handleDialogConfirm`.

  The `http` layer never rejects, so branch on `data.success` inside the react-query `onSuccess` options object passed to `register(...)`. Add an `errorMessage` state, wire the mutation result inside `handleDialogConfirm`, and render an inline destructive `Alert` above the summary card when an error is present (cleared on the next successful validation/submit).

  Apply these **targeted** changes to `src/features/auth/components/confirm-registration.tsx`:

  1. Add `Alert`, `AlertDescription`, `AlertTitle` to the imports (from `@components/ui/alert`):

  ```tsx
  import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
  ```

  2. Destructure `setSuccess` from the store and add an `errorMessage` state:

  ```tsx
  const { formData, prevStep, setSuccess } = useRegistrationStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  ```

  3. Clear the error before validation in `handleSubmitClick`:

  ```tsx
  const handleSubmitClick = () => {
    setErrorMessage(null);
    const isValidData = RegisterPensionerSchema.safeParse(formData);
    if (isValidData.success) {
      setIsConfirmOpen(true);
    } else {
      showSnackbar(
        isValidData.error.issues[0]?.message || 'Registration failed. Please try again.'
      );
    }
  };
  ```

  4. Pass `onSuccess` to the `register(...)` call inside `handleDialogConfirm`:

  ```tsx
  const handleDialogConfirm = () => {
    setIsConfirmOpen(false);
    register(
      {
        ...formData,
        password: formatPassword(formData.password),
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            setSuccess();
          } else {
            setErrorMessage(data.message || 'Registration failed. Please try again.');
          }
        },
      }
    );
  };
  ```

  5. Render the inline error `Alert` as the first child inside the root `View`, above the summary card:

  ```tsx
  <View className="w-full gap-4">
    {errorMessage ? (
      <Alert variant="destructive">
        <AlertTitle>Registration Failed</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    ) : null}
    {/* ...summary card, Back/Submit buttons, RegistrationConfirmDialog unchanged... */}
  </View>
  ```

  Do **not** change the summary rows, the Back/Submit buttons, or the `<RegistrationConfirmDialog ... />` render.

- [ ] **Step 2: Lint.**

  Run: `npm run lint`
  Expected: no errors.

- [ ] **Step 3: Commit.**

  ```bash
  git add src/features/auth/components/confirm-registration.tsx
  git commit -m "feat: surface registration success/error on confirm submit"
  ```

---

### Task 4: Render success view in the registration screen shell

**Files:**

- Modify: `src/features/auth/screens/registration.tsx`

- [ ] **Step 1: Branch on `isSuccess` in the shell.**

  When `isSuccess` is true, render `RegistrationSuccessView` inside the `Container` and omit the step header, the active form, and the footer. Otherwise render the existing content.

  ```tsx
  import { View } from 'react-native';

  import {
    ConfirmRegistrationScreen,
    RegistrationPasswordForm,
    RegistrationPersonalForm,
    RegistrationStatusForm,
    RegistrationStepHeader,
    RegistrationSuccessView,
  } from '../components';
  import { Container } from '@components/layout';
  import { FooterImg } from '@components/common/nic-footer-img';
  import { useRegistrationStore } from '../store/registration';

  /**
   * Four-step pensioner registration wizard shell.
   *
   * Renders a top-corner exit that RESETS the flow before navigating back to
   * login (prevents stale half-finished data on shared devices), a large-print
   * step header with progress bar, and the active step form. Content is
   * top-aligned so the keyboard cannot shift layout.
   *
   * After a successful submit, the entire step content (header, form, footer)
   * is replaced by the success view.
   *
   * @returns The rendered registration screen.
   */
  export default function RegistrationScreen() {
    const { step, isSuccess } = useRegistrationStore();

    if (isSuccess) {
      return (
        <Container className="flex-1 gap-5 py-10">
          <View className="mt-6 w-full">
            <RegistrationSuccessView />
          </View>
        </Container>
      );
    }

    return (
      <Container className="flex-1 gap-5 py-10">
        {/* Step X of 4 + progress bar + title + instruction */}
        <RegistrationStepHeader step={step} />

        {/* Active step form */}
        <View className="mt-6 w-full">
          {step === 1 && <RegistrationStatusForm />}
          {step === 2 && <RegistrationPersonalForm />}
          {step === 3 && <RegistrationPasswordForm />}
          {step === 4 && <ConfirmRegistrationScreen />}
        </View>

        {/* Anchored to viewport bottom when content is short */}
        <View className="mt-auto pt-6">
          <FooterImg />
        </View>
      </Container>
    );
  }
  ```

- [ ] **Step 2: Lint.**

  Run: `npm run lint`
  Expected: no errors.

- [ ] **Step 3: Commit.**

  ```bash
  git add src/features/auth/screens/registration.tsx
  git commit -m "feat: render registration success view in screen shell"
  ```

---

### Task 5: Manual verification

- [ ] **Step 1: Verify the confirmation dialog still gates submission.**

  On Step 4, tap Submit with valid data. Expected: the `RegistrationConfirmDialog` still opens before any request fires. Submit with invalid data → the dialog does not open and the validation snackbar shows (existing behavior preserved).

- [ ] **Step 2: Verify success flow.**

  Complete Steps 1–3, then on Step 4 tap Submit → Confirm in the dialog with an endpoint that returns `success: true`. Expected: the screen swaps to the emerald success card (no "Step 4 of 4" header, no form, no footer); tap "Go to Login" → wizard resets and navigates to `/auth`.

- [ ] **Step 3: Verify error flow.**

  On Step 4, tap Submit → Confirm with an endpoint/condition that returns `success: false` (or go offline). Expected: a destructive "Registration Failed" alert appears above the summary card; the summary card, Back/Submit buttons, and the confirmation dialog flow remain functional; the alert clears when Submit is tapped again.

- [ ] **Step 4: Verify lint passes.**

  Run: `npm run lint`
  Expected: clean across all modified files.
