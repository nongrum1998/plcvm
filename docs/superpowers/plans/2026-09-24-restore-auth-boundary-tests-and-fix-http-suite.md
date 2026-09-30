# Restore Auth-Boundary Test Suites + Fix HTTP Wrapper Suite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the three auth-boundary test suites deleted by the auth→login/registration split (green against current code, zero production-code changes) and fix the pre-existing `http` wrapper suite failure at the test level.

**Architecture:** Two independent follow-ups on one branch (`test/restore-auth-boundary-suites-and-fix-http`) off `master`. Follow-up 1 re-locates the deleted suites into the new feature slices and reconciles stale assertions against the current APIs (store shape, component copy, validation surface). Follow-up 2 replaces the broken `@utils/http/client` module mock with an `axios` mock so the real wrapper (`createHttp` in `packages/api`) and real `client.ts` run as the unit under test. No production file is touched.

**Tech Stack:** Expo SDK 57 / React Native 0.86, expo-router, TypeScript strict, zod v3, zustand, `@pension/api` workspace package, jest via `jest-expo`, pnpm.

**Spec:** Repo `apps/cpps`, branch `master` @ `1297828`. Approved follow-ups after the auth-slice refactor (`1708ede..1297828`): (1) restore the 3 deleted suites, (2) fix `src/shared/test/utils/http/http.test.ts`. Security review flagged the missing coverage as Important; suite fix is a pre-existing failure.

## Global Constraints

- **No production-code changes.** Do not modify any `src/**` or `packages/**` file that is not a test. Fixes must live in test files only. (`client.ts` stays untouched — root cause is in the test's mock shape, not production.)
- Tests must live under `src/features/<feature>/test/` or `src/shared/**/test/` (jest `testMatch` in `packages/jest-config/jest.config.js`; only those globs are collected).
- Imports go through feature barrels where practical: `@features/login/validators`, `@features/registration/store`, `@features/registration/components`. No dead `@features/auth/...` paths (slice was deleted).
- `test/setup.ts` already mocks `expo-application` and `expo-device`; per-suite mocks are added inside each test file.
- Jest baselines (captured this session): 6 suites, 1 failed (`http.test.ts`), 5 passed, 129 tests passing. `npx tsc --noEmit` reports exactly **21** pre-existing errors (do not add or remove any).
- Commits are Conventional Commits with `test:` prefix. Work on branch `test/restore-auth-boundary-suites-and-fix-http` created off `master`.
- Finish every task with a verify step; full-repo gate at the end: `npx tsc --noEmit` → `pnpm test` → `pnpm lint`.
- `pnpm lint` runs ESLint + `prettier -c`. Run `pnpm format` on changed files if the prettier check complains.

## Verified Facts (do not re-derive)

- **LoginSchema surface** (`src/features/login/validators/login.ts`): `username: ppoNoValidation('Username')` → `z.string('Username is Required').regex(ALLOW_REGEX.USERNAME, 'Invalid Username').trim()`; `ALLOW_REGEX.USERNAME = /^[a-zA-Z0-9_/]{3,20}$/`; `password: passwordValidation.transform(v => formatPassword(v))` with `passwordValidation = z.string('Password is required').min(8, 'Password must be at least 8 characters').max(50, 'Password must be at most 50 characters')`. Barrel `@features/login/validators` re-exports `./login`. This is behaviorally identical to the pre-move schema, so the restored validator suite needs **only** its import updated.
- **Registration store API** (`src/features/registration/store/registration.ts`): `step` (default 1), `formData` default `{ dob:'', password:'', bank_accno:'', ppo_no:'' }` (`Omit<RegisterInput,'confirm_password'>`), `validation` default `null` (`Omit<RegisterInput,'confirm_password'|'password'>`), `setStep/nextStep/prevStep` (`nextStep` caps at **3**, `prevStep` floors at 1), `saveData` (shallow merge), `setValidationData`, `reset()` (now resets step **and** formData **and** validation). **No `isSuccess` / `setSuccess` / `isError` / `setIsError`** any more.
- **RegisterInput** (`src/features/registration/validators/registration.ts`): `{ ppo_no?, dob, bank_accno, password, confirm_password, image? }`.
- **RegistrationErrorView** (`src/features/registration/components/registration-error-view.tsx`): renders headline `Registration Failed`, subtitle `Face verification was unable to complete`, body `{message}` defaulting to `Please try again`, and a `Button` labelled `Try again`. `handleDone` = `reset()` + `navigate(PAGE_ROUTES.AUTH.REGISTER, 'replace')`. `PAGE_ROUTES.AUTH.REGISTER === '/auth/register'`. Component graph pulls `@hooks/use-safe-navigation` (expo-router) and the feature components barrel also pulls the camera component → `react-native-vision-camera`.
- **HTTP suite root cause (verified by running)**: the failing line is `http.get(...)` — `http` (the named export from `@utils/http`, barrel re-export of `export { default, http } from './client'`) is `undefined`. The mock factory only supplies `default`, so the named `http` export is missing. `apiClient`/`mockClient` (the default import) resolves fine — the first test fails at line 25, _after_ `mockClient.get.mockResolvedValue(...)` on line 24 succeeded. Fix class: repair the mock shape so the real wrapper is exercised.
  - `packages/api` exposes **only** `createApi` (`exports: { ".": "./src/index.ts" }`); deep paths like `@pension/api/src/http` are blocked by the exports map (verified) and `createHttp`/`handle-res.ts` are not re-exported. So the real wrapper cannot be reached through the package surface once the module is mocked.
  - Correct boundary: mock `axios` instead. Real `client.ts` then runs: real `createApi` → mock axios instance + **real** `createHttp` wrapper → **real** `handleResponse`/`handleAxiosError` normalizers. All 6 assertions match that code path exactly (`status === 200` success, `error.response` → `{success:false,status,message}`, `error.request` → network message, generic `Error` → `error.message`).
  - `api-client.ts` uses `import axios from 'axios'` and calls `axios.create(...)` (babel interop → `.default.create`). `createAuthService(client)` only defines methods (no call at construct). Interceptor closures constructed at import need `expo-secure-store` / `expo-router` / `@lib/encryption` mocks — these already exist in the test; `@lib/encryption` needs `decryptFields` added (imported by `decrypt-response.ts`).

## Workflow

```mermaid
flowchart LR
  A[master 1297828] --> B[Branch test/restore-auth-boundary-suites-and-fix-http]
  B --> T1[Task 1: login validator suite]
  T1 --> T2[Task 2: registration store suite]
  T2 --> T3[Task 3: registration error-view suite]
  T3 --> T4[Task 4: http wrapper suite fix]
  T4 --> G[Gate: tsc 21 / pnpm test green / pnpm lint]
```

---

### Task 1: Restore the login validator boundary suite

**Files:**

- Create: `src/features/login/test/validators/auth.test.ts` (270 lines, restored from `1297828^`)

**Interfaces:**

- Consumes: `LoginSchema` from `@features/login/validators` (barrel), `formatPassword` from `@lib/encryption` (mocked).
- Produces: green suite pinning the `LoginSchema` → `formatPassword` encrypt-on-parse contract; a precedent for restoring the other two suites.
- Starts: create branch `test/restore-auth-boundary-suites-and-fix-http` off `master` (working tree is clean on `master`).

- [ ] **Step 1: Create the branch**

```bash
git checkout master && git pull --ff-only 2>/dev/null || true
git checkout -b test/restore-auth-boundary-suites-and-fix-http
```

- [ ] **Step 2: Restore the suite with the import updated**

Get the exact original body from git:

```bash
git show '1297828^:src/features/auth/test/validators/auth.test.ts' > src/features/login/test/validators/auth.test.ts
```

Then edit **only line 1** of the file — replace the dead import with the login validators barrel:

```ts
import { LoginSchema } from '@features/login/validators';
```

The rest of the file is byte-identical to the git original: `jest.mock('@lib/encryption', () => ({ formatPassword: jest.fn((value: string) => `formatted:${value}`) }))`, the `expectValid` / `expectInvalid` helpers, and every `describe`/`it` (valid login, username length/char/whitespace/type boundaries, password boundaries/types, the `formatPassword` transform contract, whole-object cases). No assertion changes are needed — `ppoNoValidation('Username')` produces `Invalid Username` / `Username is Required` and `passwordValidation` produces the exact messages the suite already expects (verified: `src/shared/validation/common/index.ts:28-31,38-42`, `ALLOW_REGEX.USERNAME` at `src/shared/utils/regex-patterns/index.ts:33`).

- [ ] **Step 3: Run the suite (must pass green)**

```bash
pnpm test src/features/login/test/validators/auth.test.ts
```

Expected: `PASS`, ~50 tests, 0 failures. If any assertion fails, it means the promoted validation behavior diverged from the pinned contract — do NOT edit production code; re-verify against `src/shared/validation/common/index.ts` and adjust the _test_ only if the divergence is intentional (it is not expected; the promotion was behavior-preserving).

- [ ] **Step 4: Commit**

```bash
git add src/features/login/test/validators/auth.test.ts
git commit -m "test(login): restore login schema boundary suite"
```

---

### Task 2: Restore the registration store suite, reconciled to the current store API

**Files:**

- Create: `src/features/registration/test/store/registration.test.ts`

**Interfaces:**

- Consumes: `useRegistrationStore` from `@features/registration/store` (store barrel re-exports only `./registration`).
- Produces: green characterization suite of the **current** store API (3-step wizard, `bank_accno` form key, `reset()` clears validation, no success/error flags).

**Approach:** The git original (177 lines, RED pre-move) pins the _older_ store shape: 4-step wizard, `bank_account_number` form key, `isSuccess`/`setSuccess`, `validation` surviving `reset()`. All four have changed. Restore-as-is is impossible; this task rewrites it as a characterization suite of the current API — exactly what the zero-behavior-change rule requires.

- [ ] **Step 1: Write the suite with the current store contract**

Create `src/features/registration/test/store/registration.test.ts`:

```ts
import { act } from '@testing-library/react-native';
import { useRegistrationStore } from '@features/registration/store';

describe('useRegistrationStore', () => {
  beforeEach(() => {
    act(() => {
      useRegistrationStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('starts at step 1', () => {
      expect(useRegistrationStore.getState().step).toBe(1);
    });

    it('starts with empty form data (bank_accno, no confirm_password)', () => {
      expect(useRegistrationStore.getState().formData).toEqual({
        ppo_no: '',
        dob: '',
        password: '',
        bank_accno: '',
      });
    });

    it('starts without validation data', () => {
      expect(useRegistrationStore.getState().validation).toBeNull();
    });
  });

  describe('step navigation (3-step wizard)', () => {
    it('sets the step', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
      });
      expect(useRegistrationStore.getState().step).toBe(3);
    });

    it('moves to the next step', () => {
      act(() => {
        useRegistrationStore.getState().nextStep();
      });
      expect(useRegistrationStore.getState().step).toBe(2);
    });

    it('does not go beyond step 3', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
        useRegistrationStore.getState().nextStep();
      });
      expect(useRegistrationStore.getState().step).toBe(3);
    });

    it('moves to the previous step', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
        useRegistrationStore.getState().prevStep();
      });
      expect(useRegistrationStore.getState().step).toBe(2);
    });

    it('does not go below step 1', () => {
      act(() => {
        useRegistrationStore.getState().prevStep();
      });
      expect(useRegistrationStore.getState().step).toBe(1);
    });
  });

  describe('form data', () => {
    it('saves partial form data', () => {
      act(() => {
        useRegistrationStore.getState().saveData({
          ppo_no: 'PPO123',
          dob: '01/01/1990',
        });
      });
      expect(useRegistrationStore.getState().formData).toEqual({
        ppo_no: 'PPO123',
        dob: '01/01/1990',
        password: '',
        bank_accno: '',
      });
    });

    it('merges new data with existing form data', () => {
      act(() => {
        useRegistrationStore.getState().saveData({ ppo_no: 'PPO123' });
        useRegistrationStore.getState().saveData({ password: 'secret' });
      });
      expect(useRegistrationStore.getState().formData).toEqual({
        ppo_no: 'PPO123',
        dob: '',
        password: 'secret',
        bank_accno: '',
      });
    });
  });

  describe('validation', () => {
    it('sets validation data (no password or confirm_password)', () => {
      const validationData = {
        dob: '01/01/1990',
        bank_accno: '123456789',
      };
      act(() => {
        useRegistrationStore.getState().setValidationData(validationData);
      });
      expect(useRegistrationStore.getState().validation).toEqual(validationData);
    });
  });

  describe('reset', () => {
    it('resets step, form data, and validation', () => {
      act(() => {
        useRegistrationStore.getState().setStep(3);
        useRegistrationStore.getState().saveData({ ppo_no: 'PPO123', password: 'secret' });
        useRegistrationStore.getState().setValidationData({
          dob: '01/01/1990',
          bank_accno: '123456789',
        });
      });

      act(() => {
        useRegistrationStore.getState().reset();
      });

      expect(useRegistrationStore.getState()).toMatchObject({
        step: 1,
        formData: { ppo_no: '', dob: '', password: '', bank_accno: '' },
        validation: null,
      });
    });
  });
});
```

Notes for the implementer (do not "helpfully" re-add it to the store):

- The original `success` → `setSuccess`/`isSuccess` describe block is **deleted** — the field/action no longer exists.
- `setValidationData` takes `Omit<RegisterInput, 'confirm_password' | 'password'>`; `bank_accno` replaces the old `bank_account_number`.
- `reset()` now nulls `validation` — the OLD test asserted it survived (`// your current reset() does not reset validation`); the new contract is the opposite. Assert the current behavior.
- Max step is **3** (wizard: 1 = PPO check, 2 = details, 3 = camera/submit), not 4.

- [ ] **Step 2: Run the suite (must pass green)**

```bash
pnpm test src/features/registration/test/store/registration.test.ts
```

Expected: `PASS`, 12 tests, 0 failures.

- [ ] **Step 3: Commit**

```bash
git add src/features/registration/test/store/registration.test.ts
git commit -m "test(registration): reconcile registration store suite with current API"
```

---

### Task 3: Restore the registration error-view suite

**Files:**

- Create: `src/features/registration/test/components/registration-error-view.test.tsx`

**Interfaces:**

- Consumes: `RegistrationErrorView` from `@features/registration/components` (components barrel; the follow-up requires barrel import), `useRegistrationStore` from `@features/registration/store`, `PAGE_ROUTES` from `@utils/constants`.
- Mocks: `expo-secure-store`, `react-native-vision-camera` (the camera sibling in the components barrel pulls it), `@hooks/use-safe-navigation`.
- Produces: green suite binding current copy (`Registration Failed`, `Please try again`, `Try again`) and the reset-and-navigate behavior.

**Approach:** The git original (33 lines, RED) expected deleted copy (`We could not create your account`, `Try Again`) and `setIsError`/`isError` state that no longer exists. Rewrite against the current component (`src/features/registration/components/registration-error-view.tsx`): it renders `{message}` defaulting to `Please try again` inside a body `<Text>` and a `Button` labelled `Try again`, and `handleDone` = `reset()` + `navigate(PAGE_ROUTES.AUTH.REGISTER, 'replace')`. `useSafeNavigation` is mocked because the real hook needs an `expo-router` `useRouter` context.

- [ ] **Step 1: Write the suite**

Create `src/features/registration/test/components/registration-error-view.test.tsx`:

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { RegistrationErrorView } from '@features/registration/components';
import { useRegistrationStore } from '@features/registration/store';
import { PAGE_ROUTES } from '@utils/constants';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('react-native-vision-camera', () => ({
  useCameraDevice: jest.fn(() => null),
  useCameraPermission: jest.fn(() => ({ hasPermission: false, requestPermission: jest.fn() })),
}));

const mockNavigate = jest.fn();
jest.mock('@hooks/use-safe-navigation', () => ({
  useSafeNavigation: () => ({ navigate: mockNavigate, back: jest.fn() }),
}));

describe('RegistrationErrorView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useRegistrationStore.getState().reset();
    });
  });

  it('renders the failure message and retry action', () => {
    render(<RegistrationErrorView />);

    expect(screen.getByText('Registration Failed')).toBeTruthy();
    expect(screen.getByText('Please try again')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('renders a custom message when one is provided', () => {
    render(<RegistrationErrorView message="Face verification was unable to complete" />);

    expect(screen.getByText('Face verification was unable to complete')).toBeTruthy();
  });

  it('resets the wizard and navigates to register when Try again is pressed', () => {
    act(() => {
      useRegistrationStore.getState().setStep(3);
    });

    render(<RegistrationErrorView />);
    fireEvent.press(screen.getByText('Try again'));

    expect(mockNavigate).toHaveBeenCalledWith(PAGE_ROUTES.AUTH.REGISTER, 'replace');

    const state = useRegistrationStore.getState();
    expect(state.step).toBe(1);
    expect(state.formData).toEqual({ ppo_no: '', dob: '', password: '', bank_accno: '' });
  });
});
```

- [ ] **Step 2: Run the suite (must pass green)**

```bash
pnpm test src/features/registration/test/components/registration-error-view.test.tsx
```

Expected: `PASS`, 3 tests, 0 failures.

**Contingency (only if Step 2 fails on a module the vision-camera mock does not cover)** — the components barrel also re-exports `registration-camera.tsx` whose graph includes `react-native-vision-camera`. If another prebuilt native module surfaces (e.g. `expo-image-manipulator` via `use-image-compressor`), do NOT broaden the mocks indefinitely: switch the import to the deep component path and drop the now-unneeded camera mock:

```tsx
import { RegistrationErrorView } from '@features/registration/components/registration-error-view';
```

Re-run Step 2. Keeping the barrel import is preferred but not mandatory; the suite's green state matters more than the import depth (documented deviation from the follow-up text).

- [ ] **Step 3: Commit**

```bash
git add src/features/registration/test/components/registration-error-view.test.tsx
git commit -m "test(registration): restore registration error view suite"
```

---

### Task 4: Fix the http wrapper suite root cause

**Files:**

- Modify: `src/shared/test/utils/http/http.test.ts`

**Interfaces:**

- Consumes: real `@utils/http` barrel, real `client.ts`, real `@pension/api` `createApi`/`createHttp`/`handle-response`; mocked `axios` transport.
- Produces: green suite — all 6 assertions unchanged in meaning.

**Root cause (verified):** `http.test.ts` mocks `@utils/http/client` with a factory that supplies only `default`. The suite imports `{ http } from '@utils/http'`, which re-exports the **named** `http` from the same mocked module — so `http` is `undefined` and every `http.get/post/put/delete` call throws. `packages/api` does not expose `createHttp` (exports map blocks deep paths), so the real wrapper cannot be injected into that factory.

**Fix:** stop mocking the client module entirely and mock `axios` at the transport layer. Real `client.ts` then initializes the real `createApi` pipeline over a mock axios instance and exposes the **real** `createHttp` wrapper and real normalizers — the suite's six assertions map exactly onto the real code path (`handleResponse` marks `status === 200` success; `handleAxiosError` returns `{success:false,status,message}` for `error.response`, the network message for `error.request`, and `error.message` for a generic `Error`). No production change.

- [ ] **Step 1: Edit the mock section of `http.test.ts`**

Delete the `jest.mock('@utils/http/client', ...)` factory (the `__esModule`/`default` block). Replace the mocks at the top of the file so it reads:

```ts
import { AxiosError } from 'axios';
import { http } from '@utils/http';
import apiClient from '@utils/http/client';

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  const client = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  const realDefault = actual.default ?? actual;
  return {
    ...actual,
    default: { ...realDefault, create: jest.fn(() => client) },
  };
});
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@lib/encryption', () => ({
  encryptFields: jest.fn((v: unknown) => v),
  decryptFields: jest.fn((v: unknown) => v),
}));

const mockClient = apiClient as jest.Mocked<typeof apiClient>;
```

Why each piece:

- `jest.mock('axios', ...)`: `api-client.ts` calls `axios.create(...)` via the default import (babel interop → `.default.create`). The mock returns the real axios surface («spread of `actual`» keeps the real `AxiosError` class so `instanceof` in `handleAxiosError` matches the class the test constructs) plus an overridden `default.create` that returns the shared mock client.
- `mockClient` is now the real `apiClient.client` — the same instance the real wrapper calls, because `client.ts` constructs it once through the mocked `create`.
- `interceptors.request.use` / `response.use` are `jest.fn()`s so the real `createApi` interceptor registration is a no-op; the tested `http.*` calls invoke the wrapper directly (`client.get/post/...`), never the interceptors.
- `decryptFields` is added to the `@lib/encryption` mock because the now-real `decrypt-response.ts` imports it (it is only invoked for string bodies, but keep the module self-consistent).

The remaining file body is unchanged: `okResponse`, `beforeEach(() => jest.clearAllMocks())`, and all six `describe('http wrapper')` tests.

- [ ] **Step 2: Run the suite (must pass green)**

```bash
pnpm test src/shared/test/utils/http/http.test.ts
```

Expected: `PASS`, 6 tests, 0 failures. If any assertion drifts, it means the real normalizers differ from the suite's contract — read `packages/api/src/http/handle-res.ts` and reconcile the _test expectation_ only. Do NOT modify `client.ts` or `packages/api`.

- [ ] **Step 3: Confirm no other suite regressed from the axios mock**

The `axios` mock is scoped to this file (per-file jest module registry). Verify the full suite stays green in the gate below; no other test file is touched.

- [ ] **Step 4: Commit**

```bash
git add src/shared/test/utils/http/http.test.ts
git commit -m "test(http): mock axios transport so the real wrapper runs in the http suite"
```

---

### Task 5: Full-repo verification gate (no commit)

**Files:** none — run gates only.

- [ ] **Step 1: Typecheck — must stay at exactly 21 pre-existing errors**

```bash
npx tsc --noEmit 2>&1 | grep -c 'error TS'
```

Expected: `21` (the pre-existing `@pension/core`, `UserT` profile/verification errors). The new suite files compile clean and add no errors.

- [ ] **Step 2: Full test suite — zero failures**

```bash
pnpm test
```

Expected: **9** suites passing, **0** failed (was 6 suites / 1 failed / 129 passed). 3 restored suites + 6 http tests added on top of the 129 baseline.

- [ ] **Step 3: Format + lint — clean**

```bash
pnpm format   # only if `pnpm lint` flags prettier issues on the 4 changed files
pnpm lint
```

Expected: ESLint clean, `prettier -c` clean (0 files "may be incorrect").

- [ ] **Step 4: Confirm branch is clean and only test files changed**

```bash
git status --short
git log --oneline master..HEAD
```

Expected: 4 `test:` commits, working tree clean, diff touches exactly the 4 created files + `http.test.ts`. No `src/**` production file and no `packages/**` file in the diff.

- [ ] **Step 5: Report and present finishing options**

Report the before/after evidence (baseline vs. now: suite/test counts, tsc count, lint) and let the user choose merge / PR / keep-branch / discard per the finishing-a-development-branch flow. Do **not** merge to `master` without explicit instruction.

## Self-Review

- **Spec coverage:** FU1 — restore all three deleted suites ✓ (Tasks 1–3), each GREEN against current code, in `src/features/<feature>/test/`, imports via feature barrels, store test reconciled to the current API (documented), error-view test has `expo-secure-store` mocked and uses the components barrel, validator suite checked against the surfaced `LoginSchema`/validators barrel, zero production changes. FU2 — root-cause step + minimal test-level fix, `client.ts` untouched (justified: root cause is mock shape; the real wrapper/normalizers are exercised via the `axios` mock), green gate + no regressions ✓. Acceptance criteria enumerated in Task 5 ✓.
- **Placeholder scan:** every step carries concrete commands and full file contents; the single contingency in Task 3 contains its exact alternative code.
- **Type consistency:** `useRegistrationStore.getState()` names match `src/features/registration/store/registration.ts` exactly; `formData`/`validation` key sets match `RegisterInput`; mock factory variable `mockNavigate` follows the hoisting-safe `mock` prefix convention.

---

## Execution Notes (appended 2026-09-24, BUILD complete)

### Branch & commits
Branch `test/restore-auth-boundary-suites-and-fix-http` cut from `master` @ `f70ba3d`
(after the user's unrelated changes were committed separately: `9e8cda9`, `f70ba3d`).

- `8422ed1 test(login): restore login schema boundary suite`
- `fc4af77 test(registration): reconcile registration store suite with current API`
- `327de24 test(registration): restore registration error view suite`
- `cb22dc3 test(http): mock axios transport so the real wrapper runs in the http suite`

### Deltas vs. plan
- **Task 1** restored suite has **61 tests** (plan estimated ~50) — suite passes as-is after the
  line-1 import swap (`@features/auth/validators/auth` → `@features/login/validators`).
- **Task 3** used the documented contingency: deep import of `registration-error-view` (barrel pulls
  `react-native-vision-camera-face-detector`, un-buildable in jest). `react-native-vision-camera`
  mock dropped; `expo-secure-store` mock kept. Additional discovery: **RNTL v14 renders/events are
  async** (`await render(...)`, `await fireEvent.press(...)`); React 19.2 `act` wrapping of store
  mutations before `await render()` yields an empty tree, so store mutations run bare. Custom-message
  fixture changed to `"Network connection lost"` to avoid duplicate-text match with the component's
  hardcoded subtitle.
- **Task 4 root cause (axios):** jest resolves `axios` for the test file via the package `browser`
  mapping to `dist/browser/axios.cjs`, and `@pension/api` resolves the same entry — the mock misses
  because `import axios from 'axios'` picks the whole module object (axios is CJS with
  `__esModule`), so only `.default.create` was overridden while top-level `create` came from the real
  `...actual` spread. Fix: return object stubs **both** top-level `create` and `default.create` with
  the same jest.fn; keep `...actual` for `AxiosError`. 6/6 green. A few intermediate probes
  (`_probe.test.ts`, `packages/api/src/_resolver-probe.ts`) were created and deleted.

### Gate evidence
- `pnpm test`: **8 suites, 210 tests, 0 failed** (was: 5 pre-existing; +login, +registration store,
  +error view, http repaired).
- `npx tsc --noEmit`: **5 errors, all in user-WIP production files** (dlc-screen,
  face-verification, verification-status, shared/hooks/index — `use-init-verification`/related
  mid-refactor). **0 errors from test changes.**
- `pnpm lint`: 3 errors, all the same user-WIP `import/no-unresolved` set; our files contribute only
  one pre-existing `import/no-named-as-default` warning on `apiClient`. No `--fix`-auto applicable.
- **Whitespace/lint note:** `prettier -c` and `eslint` pass on the 4 test files.
- The user's other uncommitted WIP (profile update, verification refactor, dlc-status, endpoints,
  pnpm-lock, deletions of `use-init-verification.ts` / `use-verification-status.ts`) was left exactly
  as found and is NOT part of these commits. Working tree shows only those, plus this plan doc.
