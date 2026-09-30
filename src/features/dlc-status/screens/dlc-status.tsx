import { View, Text, RefreshControl } from 'react-native';
import { Container } from '@components/layout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@components';
import { AlertDescription, Alert, AlertTitle } from '@components/ui';
import { FooterImg } from '@components/common';
import { useDlcStatus } from '@hooks/use-dlc-status';
import { SubmitDLCCard } from '@components/common/submit-dlc-card';

export const DLCStatusScreen = () => {
  const { isLoading, isFetching, refetch, data } = useDlcStatus();

  const isPhotoSubmitted = data?.facial_status === 'Approved';

  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <Container
        refreshControl={
          <RefreshControl refreshing={isFetching || isLoading} onRefresh={refetch} />
        }>
        <View className="w-full gap-5">
          <View className="gap-2">
            <View className="bg-primary/10 self-start py-1">
              <Text className="text-sm font-bold uppercase tracking-wider text-primary">
                Status
              </Text>
            </View>

            <Text className="text-2xl font-extrabold tracking-tight text-foreground">
              Digital Life Certificate
            </Text>

            <Text className="text-sm font-medium text-muted-foreground">
              Pensioner digital life verification status
            </Text>
          </View>
          {/* Section Subtitle */}
          <View className="bg-muted/40 rounded-md border border-gray-300 p-3">
            <Text className="text-center text-sm font-semibold leading-5 text-muted-foreground">
              {isPhotoSubmitted
                ? 'Details of Photo Submitted'
                : 'Details of Last Face Verification & Self Declarations'}
            </Text>
          </View>

          {/* Verification Details Card */}
          <View className="gap-4 rounded-md border border-gray-200/80 bg-card p-5">
            <View className="gap-3">
              {/* Date */}
              <View className="bg-muted/40 flex-row items-center justify-between rounded-md px-3.5 py-3">
                <Text className="text-sm font-medium text-muted-foreground">Date</Text>
                <Text className="text-sm font-bold text-foreground">
                  {data?.facial_regn_date || '—'}
                </Text>
              </View>

              {/* Time */}
              <View className="bg-muted/40 flex-row items-center justify-between rounded-md px-3.5 py-3">
                <Text className="text-sm font-medium text-muted-foreground">Next DLC (before)</Text>
                <Text className="text-sm font-bold text-foreground">{data?.app_exp || '—'}</Text>
              </View>

              <>
                {/* Place */}
                <View className="bg-muted/40 flex-row items-center justify-between rounded-md px-3.5 py-3">
                  <Text className="text-sm font-medium text-muted-foreground">Time</Text>
                  <Text className="text-sm font-bold text-foreground">
                    {data?.certificate_datetime || '—'}
                  </Text>
                </View>

                {/* Non-Employment Declaration Card */}
                <View className="flex-row items-center justify-between gap-2 rounded-md border border-gray-200 bg-background p-3.5">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Are you Re-Employed
                  </Text>

                  <View className="items-end rounded-md bg-secondary px-2.5 py-1">
                    <Text className="text-sm font-bold text-secondary-foreground">
                      {data?.nec || '—'}
                    </Text>
                  </View>
                </View>

                {/* Re-Marriage Declaration Card */}
                <View className="flex-row items-center justify-between gap-2 rounded-md border border-gray-200 bg-background p-3.5">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Are u Re-Married
                  </Text>
                  <View className="items-end rounded-md bg-secondary px-2.5 py-1">
                    <Text className="text-sm font-bold text-secondary-foreground">
                      {data?.nmc || '—'}
                    </Text>
                  </View>
                </View>
              </>
            </View>
          </View>
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
};
