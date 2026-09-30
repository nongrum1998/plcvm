import { View, Text, RefreshControl } from 'react-native';
import { Container } from '@components/layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, LoadingScreen } from '@components';
import { AlertDescription, Alert, AlertTitle } from '@components/ui';
import { FooterImg } from '@components/common';
import { useDlcStatus } from '@hooks/use-dlc-status';
import { SubmitDLCCard } from '@components/common/submit-dlc-card';

/**
 * Renders the "Verification Status" screen for a pensioner.
 *
 * Fetches the current verification status via {@link useDlcStatus}
 * and presents it in a scrollable, pull-to-refresh layout. The screen shows a
 * header introduction, a status badge displaying the raw `ver_status` code, a
 * dynamic section subtitle, and a "Record Overview" card listing the
 * verification date and time.
 *
 * When the verification status equals `'03'` (photo submitted), the overview
 * additionally renders the submission place plus the Non-Employment /
 * Re-Employment and Re-Marriage / Non-Marriage declaration cards derived from
 * `ver_nec`. A separate card prompts the pensioner to submit a Digital Life
 * Certificate (DLC), navigating to `PAGE_ROUTES.DLC` on press, and a warning
 * alert reminds the user that face verification is required twice per calendar
 * year. Absent field values are rendered as an em dash (`—`).
 *
 * Includes a `RefreshControl` bound to the query's `refetch`, so pulling down
 * re-fetches the latest status while `isFetching` drives the spinner.
 *
 * @returns The verification status screen within a safe area and container.
 */
export function HomeScreen() {
  const { data, isFetching, isLoading, refetch } = useDlcStatus();

  const isApproved = data?.facial_status === 'Approved';

  const msg = isApproved
    ? `Your photo was approved on ${data.facial_regn_date}. Your next DLC is due on ${data.app_date ?? '-'}`
    : `Your photo was not approved. Please complete your DLC before ${data?.app_exp}.`;

  if (isLoading || isFetching) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <Container
        refreshControl={
          <RefreshControl refreshing={isFetching || isLoading} onRefresh={refetch} />
        }>
        <View className="w-full gap-5">
          {/* Status Header Badge */}
          <View className="items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50/70 p-5">
            <View className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <Text className="text-sm font-bold uppercase tracking-wider text-emerald-800">
                Digital Life Status
              </Text>
            </View>
            <Text className="text-center text-xl font-semibold text-emerald-950">
              {data?.facial_status || '—'}
            </Text>
          </View>

          {msg !== '' && (
            <Alert variant={isApproved ? 'default' : 'destructive'}>
              <Icon name="alert-circle" size={18} className="text-destructive" />
              <View className="flex-1">
                <AlertTitle>{isApproved ? 'Info' : 'Warning'}</AlertTitle>
                <AlertDescription className="flex-1">{msg}</AlertDescription>
              </View>
            </Alert>
          )}
          <SubmitDLCCard />

          {/* Note Alert Card */}
          <Alert variant="warning">
            <Icon name="alert-triangle" size={18} className="mt-0.5 text-destructive" />
            <View className="flex-1">
              <AlertTitle className="text-sm">Important Notice</AlertTitle>
              <AlertDescription>
                Face Verification is required twice every Calendar year. Validity extends for 6
                months from your last successful verification.
              </AlertDescription>
            </View>
          </Alert>
          {/* Footer Logos */}
          <FooterImg />
        </View>
      </Container>
    </SafeAreaView>
  );
}
