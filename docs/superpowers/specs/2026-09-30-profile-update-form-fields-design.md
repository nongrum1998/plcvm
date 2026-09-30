# Profile Update Form — Field Migration

Date: 2026-09-30
Status: approved

## Problem

`src/features/profile/validators/profile.ts` was migrated to a 6-field contract
(`pan_dob`, `pan_no`, `mobile_no`, `height`, `comty_cd`, `marital_cd`) but
`profile-update-screen.tsx` was not. The form still renders `name`,
`organization` and `username` — none of which exist on `ProfileUpdateInput`.

`npx tsc --noEmit` reports 12 errors in the screen. The form is uncompilable and,
if it compiled, could never submit: the resolver rejects the empty `defaultValues`
for all six real fields.

## `pan_dob` validator bug

The existing refine is:

```ts
.refine((value) => !Number.isNaN(Date.parse(value)), 'Please enter a valid date of birth')
```

`Date.parse` reads `DD/MM/YYYY` as `MM/DD/YYYY`:

| Input        | `Date.parse` | Consequence                              |
| ------------ | ------------ | ---------------------------------------- |
| `25/08/1990` | `NaN`        | rejected — a valid DOB fails             |
| `05/08/1990` | valid        | accepted, but parsed as 5 August → 8 May |

Any day ≤ 12 silently validates against the wrong date; any day > 12 is
rejected outright. Since the form uses a `DD/MM/YYYY` mask, the refine is
replaced with an explicit format regex plus a real calendar check.

## Changes

### New: `src/features/profile/utils/constants/profile-options.ts`

`COMMUNITY_OPTIONS` and `MARITAL_STATUS_OPTIONS`, typed as
`SelectSheetOption[]` from `@components/ui`.

> **The codes below are PLACEHOLDERS.** Nothing in the repository or in
> `http/v2.http` documents the backend's `comty_cd` / `marital_cd` values. They
> are isolated in this one file so the backend team can correct them without
> touching the screen. The `PLACEHOLDER` JSDoc tag marks each constant.

### `src/features/profile/validators/profile.ts`

`pan_dob` refine only. The other five fields are left as-is.

### `src/features/profile/screens/profile-update-screen.tsx`

`name`, `organization` and `username` are deleted. Six fields replace them:

| Field          | Control       | Prefill    | Sanitizing                                        |
| -------------- | ------------- | ---------- | ------------------------------------------------- |
| Date of Birth  | `Input`       | `user.dob` | digits only, 8-digit cap, auto-slash `DD/MM/YYYY` |
| PAN Number     | `Input`       | —          | uppercase, 10-char cap                            |
| Mobile Number  | `Input`       | —          | digits only, 10-char cap                          |
| Height (cm)    | `Input`       | —          | digits + one decimal point, 5-char cap            |
| Community      | `SelectSheet` | —          | —                                                 |
| Marital Status | `SelectSheet` | —          | —                                                 |

Digit stripping is required, not cosmetic: Android IMEs leak symbols past
`keyboardType="number-pad"`. The registration form does the same thing.

Two structural fixes in the same pass:

- **`onSubmit` dead code.** `handleSubmit` already ran `zodResolver`; the extra
  `safeParse` was a redundant second gate that silently dropped the payload.
  `onSubmit` now calls `mutate` directly.
- **Success state was a dead end.** `isSuccess` replaced the form with a banner
  and no way back. The banner now renders above a still-editable form, so a
  mis-entry can be corrected in place.

## Testing

- `pan_dob`: accepts `25/08/1990`; rejects `31/02/1990`, `32/01/1990`,
  `1/1/1990`, `abc`, empty.
- Screen: renders all six field labels; DOB prefilled from `useAuthStore.user`.

Tests live in `src/features/profile/test/` per AGENTS.md.

## Verification

`npx tsc --noEmit` → `pnpm test` → `npx eslint` → `npx prettier -c`
