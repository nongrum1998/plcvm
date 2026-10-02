import { View, Text, RefreshControl } from 'react-native';
import { Container } from '@components/layout';
import { Button } from '@components';
import { useAuthStore } from '@stores/auth.store';
import { useSafeNavigation } from '@hooks';
import { PAGE_ROUTES } from '@utils/constants';
import { ProfileFieldRow } from '../components';

/**
 * Expands a stored gender code into the human-readable label shown in the
 * field list.
 *
 * The parameter is declared `'M' | 'F'` — the codes pension records use — but
 * the `'Other'` fallback is a real runtime guard rather than dead code:
 * `UserT.gender` is typed `string`, so the call site reaches this helper
 * through an `as any` cast. An unexpected or empty code therefore falls
 * through to `'Other'` instead of rendering a raw code to the user.
 *
 * @param value - Stored gender code, expected to be `'M'` or `'F'`.
 * @returns `'Male'` for `'M'`, `'Female'` for `'F'`, and `'Other'` for any
 *   other value.
 */
function getFullGenderLabel(value: 'M' | 'F') {
  return value === 'M' ? 'Male' : value === 'F' ? 'Female' : 'Other';
}

/**
 * A single label/value pair rendered by {@link ProfileFieldRow} in the
 * profile field list.
 */
type ProfileFieldT = {
  /** Field caption, e.g. `Mobile No.`. Doubles as the React list key. */
  label: string;
  /** Display text; may be a fallback glyph when the field is empty. */
  value: string;
};

/**
 * Read-only profile display screen.
 *
 * Renders the signed-in user's record from `useAuthStore.user` (`UserT`) as a
 * list of {@link ProfileFieldRow} entries beneath a "Personal info" header,
 * plus a button that navigates to `PAGE_ROUTES.PROFILE.UPDATE` for editing.
 *
 * Pull-to-refresh is wired to the auth store rather than a local fetch: the
 * `RefreshControl` calls `refresh` (which re-fetches the profile) and tracks
 * `isAuthLoading`. The store deliberately never persists that flag, so the
 * spinner reflects the in-flight request on every mount instead of restoring a
 * cached `true`.
 *
 * Empty-value handling is preserved rather than normalised, and is
 * inconsistent across the screen: `email` and `treasury_name` fall back to an
 * em dash (`—`) in the field list via `||`, while the header renders
 * `treasury_name` with a plain hyphen (`-`) via `??`. The remaining fields
 * (`pname`, `ppo_no`, `mobile_no`, `dob`) have no fallback and render blank
 * when unset.
 *
 * When `user` is `null` — before the auth store finishes hydrating, or after
 * sign-out — this renders only a "No profile data available." message.
 *
 * @returns The profile screen, or the no-data fallback when no user is loaded.
 */
export function ProfileScreen() {
  const { navigate } = useSafeNavigation();
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);
  const isLoading = useAuthStore((s) => s.isAuthLoading);

  if (!user) {
    return (
      <Container scrollable centered>
        <Text className="text-sm font-medium text-muted-foreground">
          No profile data available.
        </Text>
      </Container>
    );
  }

  const fields: ProfileFieldT[] = [
    { label: 'Email', value: user.email || '—' },
    { label: 'Name', value: user.pname },
    { label: 'Username', value: user.ppo_no },
    { label: 'Mobile No.', value: user.mobile_no },
    { label: 'Date of birth', value: user.dob },
    { label: 'Gender', value: getFullGenderLabel(user.gender as any) },
    { label: 'Treasury', value: user.treasury_name || '—' },
  ];

  return (
    <Container
      scrollable
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}>
      <View className="w-full gap-5">
        <View className="gap-2">
          <View className="bg-primary/10 self-start py-1">
            <Text className="text-sm font-bold uppercase tracking-wider text-primary">
              Personal info
            </Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            {user.pname}
          </Text>
          <Text className="text-sm font-medium text-muted-foreground">
            {user.treasury_name ?? '-'}
          </Text>
        </View>
        {/* Field list */}
        <View className="rounded-md border border-gray-200/80 bg-card p-4">
          {fields.map((f) => (
            <ProfileFieldRow key={f.label} label={f.label} value={f.value} />
          ))}
        </View>

        {/* Update action */}
        <Button size={'lg'} onPress={() => navigate(PAGE_ROUTES.PROFILE.UPDATE)}>
          Update Profile
        </Button>
      </View>
    </Container>
  );
}
