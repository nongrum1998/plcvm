import { RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container } from '@components/layout/container';
import { PaginatedList } from '@components/layout/paginated-list';
import { usePensionerStatement } from '../hooks/use-pensioner-statement';
import { PensionerStatementListItem } from '../components/pensioner-statement-list-item';
import { PensionerStatementListSkeleton } from '../components/pensioner-statement-list-skeleton';
import type { PensionerStatement } from '../types/pensioner-statement';
import { Button } from '@components/ui/button';
import { EmptyScreen } from '@components/screens/empty-screen';
import { Ternary } from '@components/common/ternary';
import { PAGE_ROUTES } from '@utils/constants/routes';
import { FooterImg } from '@components/common/nic-footer-img';
import { useSafeNavigation } from '@hooks/use-safe-navigation';
import { usePdfPreviewStore } from '@stores/pdf-preview';

/**
 * Screen displaying pensioner statements for the current year.
 *
 * Fetches statement data through the usePensionerStatement hook and renders
 * it as an expandable FlatList via PaginatedList. Shows a skeleton loading
 * state while fetching, an empty state when no statements exist, and a sticky
 * preview/download bar when a statement PDF is available. Pressing
 * Preview / Download stores the PDF URI in the pdf-preview store and
 * navigates to the PDF_PREVIEW route.
 *
 * @returns The pensioner statement screen UI.
 *
 * @example
 * <PensionStatementScreen />
 */
export const PensionStatementScreen = () => {
  const currentYear = new Date().getFullYear();
  const { data: statements, isLoading, refetch, isFetching } = usePensionerStatement();
  const uri = statements?.pdf;
  const setPdf = usePdfPreviewStore((s) => s.setPdf);
  const { navigate } = useSafeNavigation();

  const onPressPreview = () => {
    if (!uri) return;
    setPdf(uri);
    navigate(PAGE_ROUTES.PDF_PREVIEW);
  };

  if (isLoading) {
    return (
      <Container>
        <View className="gap-2 pb-2">
          <View className="self-start bg-primary-foreground py-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">
              6 Month Statements
            </Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            Pensioner Statements
          </Text>

          <Text className="text-sm font-medium text-muted-foreground">{currentYear} Statement</Text>
        </View>
        <PensionerStatementListSkeleton />
      </Container>
    );
  }

  return (
    <Container
      scrollable={false}
      className="px-6 pt-6"
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
      <SafeAreaView className="flex-1" edges={['left', 'right']}>
        {/* Header */}
        <View className="gap-2 pb-2">
          <View className="self-start bg-primary-foreground py-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">
              6 Month Statements
            </Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            Pensioner Statements
          </Text>

          <Text className="text-sm font-medium text-muted-foreground">{currentYear} Statement</Text>
        </View>

        {/* Statement List */}
        <PaginatedList
          data={statements?.pension}
          isLoading={isLoading}
          isRefreshing={isFetching && !isLoading}
          onRefresh={refetch}
          skeletonCount={4}
          skeletonHeight={140}
          keyExtractor={(_item, index) => index.toString()}
          contentContainerClassName="pb-20"
          renderItem={({ item }) => (
            <PensionerStatementListItem statement={item as PensionerStatement} />
          )}
          contentContainerStyle={{ gap: 12 }}
          ListFooterComponent={<FooterImg />}
          ListEmptyComponent={
            <EmptyScreen
              title="No Pension Statement found"
              message="Please try again after sometime"
              refresh={refetch}
            />
          }
        />
      </SafeAreaView>
      <Ternary
        condition={!uri}
        ifTrue={null}
        ifFalse={
          <View className="absolute bottom-0 left-0 right-0 h-16 flex-1 flex-row items-center justify-between border-t border-muted bg-background px-2">
            <View>
              <Text className="text-lg font-semibold tracking-wider text-secondary-foreground">
                PDF is available
              </Text>
            </View>
            <View>
              <Button onPress={onPressPreview} size={'default'}>
                Preview / Download
              </Button>
            </View>
          </View>
        }
      />
    </Container>
  );
};
