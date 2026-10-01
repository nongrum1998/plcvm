import { View, Text, RefreshControl } from 'react-native';
import { Container } from '@components/layout';
import { Button } from '@components';
import { useAuthStore } from '@stores/auth.store';
import { useSafeNavigation } from '@hooks';
import { PAGE_ROUTES } from '@utils/constants';
import { ProfileFieldRow } from '../components';

/**
 * Read-only profile display screen.
 *
 * Renders the signed-in user's data sourced from `useAuthStore.user` (type
 * `UserT`), including an avatar, and a button that pushes to the
 * `PAGE_ROUTES.PROFILE_UPDATE` route to edit the profile. When no user is
 * present, a fallback message is shown.
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

  const fields: { label: string; value: string }[] = [
    { label: 'Email', value: user.email || '—' },
    { label: 'Name', value: user.pname },
    { label: 'Username', value: user.ppo_no },
    { label: 'Mobile No.', value: user.mobile_no },
    { label: 'Date of birth', value: user.dob },
    {
      label: 'Gender',
      value: user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'Other',
    },
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
