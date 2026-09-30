# Add "View Manual" Button to Registration Instruction Screen

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a ghost/outlined "View Manual" button with a book icon to the header area of the registration instruction screen, navigating to the existing in-app User Manual at route `/user-manual`.

**Architecture:** Single-file change to `reg-instruction.tsx`. Adds a `Button` with `variant="outline"` and a book icon in the header section, below the subtitle text. Uses `router.push(PAGE_ROUTES.USER_MANUAL)` for navigation — same route already used by the login screen and drawer.

**Tech Stack:** React Native, Expo Router, existing `Button` and `Icon` components, NativeWind (Tailwind CSS).

---

## File Structure

| File                                            | Action | Purpose                                 |
| ----------------------------------------------- | ------ | --------------------------------------- |
| `src/features/auth/screens/reg-instruction.tsx` | Modify | Add "View Manual" button in header area |

No new files created. No new dependencies needed.

---

### Task 1: Add "View Manual" button to header area

**Files:**

- Modify: `src/features/auth/screens/reg-instruction.tsx:46-62` (header section)

- [ ] **Step 1: Add the "View Manual" button in the header section**

Insert a ghost/outlined button with a book icon between the subtitle text (line 60) and the closing `</View>` of the header section (line 62). The button uses the same `book-01` icon that the drawer uses for User Manual, and navigates to `PAGE_ROUTES.USER_MANUAL`.

```tsx
// After line 60 (the subtitle Text), before line 62 (closing </View>):
<Button
  variant="outline"
  size="sm"
  onPress={() => router.push(PAGE_ROUTES.USER_MANUAL)}
  className="mt-2 flex-row items-center gap-2 self-start"
  accessibilityLabel="Open user manual">
  <Icon name="book-01" size={16} className="text-primary" />
  <Text className="text-sm font-semibold text-primary">View Manual</Text>
</Button>
```

The full header section becomes:

```tsx
<View className="gap-2">
  <View className="bg-primary/10 self-start py-1">
    <Text className="text-sm font-bold uppercase tracking-wider text-primary">Guide</Text>
  </View>

  <Text className="text-2xl font-extrabold tracking-tight text-foreground">Registration Guide</Text>
  <Text className="text-sm font-medium text-muted-foreground">
    Follow the steps below to register or update your password
  </Text>

  <Button
    variant="outline"
    size="sm"
    onPress={() => router.push(PAGE_ROUTES.USER_MANUAL)}
    className="mt-2 flex-row items-center gap-2 self-start"
    accessibilityLabel="Open user manual">
    <Icon name="book-01" size={16} className="text-primary" />
    <Text className="text-sm font-semibold text-primary">View Manual</Text>
  </Button>
</View>
```

- [ ] **Step 2: Verify the button renders and navigates correctly**

Run: `npx expo start` and navigate to the Registration Instruction screen.
Expected: A small outlined button with a book icon and "View Manual" text appears below the subtitle, above the Step 1 card. Tapping it navigates to the User Manual screen.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/screens/reg-instruction.tsx
git commit -m "feat: add View Manual button to registration instruction screen"
```
