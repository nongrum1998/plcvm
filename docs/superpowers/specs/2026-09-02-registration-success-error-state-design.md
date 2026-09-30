# Registration Success / Error State — Design

**Date:** 2026-09-02
**Status:** Approved (design decisions confirmed by user)

## Goal

After a user submits Step 4 of the pensioner registration wizard, provide clear
post-submit feedback: a full success screen when the API call succeeds, and an
inline error alert (keeping the form visible) when it fails.

## Background / Current State

- `src/features/auth/screens/registration.tsx` is a 4-step wizard shell. It renders
  `RegistrationStepHeader`, the active step form, and a `FooterImg`.
- `src/features/auth/components/confirm-registration.tsx` (Step 4) uses a **two-step submit**: `Submit` → `handleSubmitClick` (validates, opens `RegistrationConfirmDialog`) → `handleDialogConfirm` fires the `useRegisterPensioner` mutation. The mutation is currently called with **no** `onSuccess`/`onError`, so nothing happens after the request completes. The confirmation dialog is an intentional anti-accidental-registration safeguard and **must be preserved**.
- `src/features/auth/store/registration.ts` is a Zustand store holding `step`,
  `formData`, and `validation`. It has no submit-status state.
- The `http` client (`src/shared/utils/http/http.ts` + `response.ts`) **never
  rejects**: every call resolves to `ApiResponse<T>` with `success: true|false`
  and a human-readable `message` field. Errors and network failures are resolved
  responses with `success: false`.

## Behavior

### Success

- When the mutation resolves with `data.success === true`, show a **full success
  screen**: an emerald success card (styled like the existing
  `SuccessStatusCard` in `face-verification-result-view.tsx`) with a large
  message and a **"Go to Login"** button.
- The success screen **replaces the entire step content**: no "Step 4 of 4"
  header, no form, no footer image.
- "Go to Login" calls `reset()` (clears the wizard) then navigates to
  `PAGE_ROUTES.AUTH.HOME` (`/auth`).

### Error

- When the mutation resolves with `data.success === false`, show an inline
  `destructive` `Alert` (title + the server-provided `message`) **above the
  Back / Submit buttons**.
- The summary card and form remain visible so the user can correct or retry.
- The error alert is cleared when the user taps Submit again (while a new
  request is pending).

## Design Decisions

1. **Success state lives in the store** (`isSuccess`), not local component
   state, because `RegistrationScreen` (the shell) must branch-render to hide
   the header + form and show the full success screen. The store is the natural
   shared location; the shell already reads `step` from it.
2. **Error state stays local** to `ConfirmRegistrationScreen` (`useState`),
   because the form + inline alert remain on screen for retry and nothing
   outside the component needs it.
3. **Mutation result is handled in `onSuccess(data)` and branched on
   `data.success`** — NOT `onError` — because the `http` layer never rejects.
   Both API failures and network failures resolve with `success: false`, so
   `onSuccess(data)` is the single handler point. The `onSuccess` options are
   attached to the `register(...)` call inside `handleDialogConfirm`, preserving
   the two-step confirmation-dialog flow. No `onError` is required.
4. **Full success screen hides header, form, and footer** (user-confirmed).
5. **Scoped edge case:** `isSuccess` is only cleared by `reset()` (called by
   "Go to Login"). If the user leaves the wizard by some other path before
   tapping "Go to Login", a stale `isSuccess` could persist for that session.
   This is accepted as low risk given the single navigation path; no extra
   clearing mechanism is added (YAGNI).

## Files

| File                                                         | Action | Responsibility                                                                       |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------ |
| `src/features/auth/store/registration.ts`                    | Modify | Add `isSuccess: boolean` + `setSuccess()`; clear it in `reset()`                     |
| `src/features/auth/components/registration-success-view.tsx` | Create | Full success card + "Go to Login" button (reset + navigate)                          |
| `src/features/auth/components/confirm-registration.tsx`      | Modify | Add local error state; wire `onSuccess` to `setSuccess()` / show error Alert         |
| `src/features/auth/screens/registration.tsx`                 | Modify | When `isSuccess`, render `RegistrationSuccessView` instead of header + form + footer |
| `src/features/auth/components/index.ts`                      | Modify | Barrel-export `registration-success-view`                                            |

## Verification

- This project has **no test framework** (no jest/vitest config, no test
  scripts, no test files). Adding one is out of scope (YAGNI).
- Verification is `npm run lint` (eslint + prettier) and manual review of the
  rendered flow.
- Manual checks:
  - Submit with a stubbed/unavailable endpoint → inline destructive Alert.
  - Submit with a successful endpoint → full success screen; tap "Go to Login"
    → wizard reset + navigates to `/auth`.
