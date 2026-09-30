import { View } from 'react-native';
import { Skeleton } from '@components/ui/skeleton';

interface PensionerStatementListSkeletonProps {
  /**
   * Number of skeleton cards to show. Default: 4.
   */
  count?: number;
}

/**
 * Skeleton loading placeholder for the pensioner statement list.
 *
 * Renders `count` bordered placeholder cards that mirror the visual layout
 * of PensionerStatementListItem (header row with date range + months chip,
 * two summary rows, net-amount row with top border, and a toggle line), so
 * the loading state matches the final content with no layout shift. Uses the
 * shared pulsing Skeleton primitive. Rendered inside the screen's loading
 * branch (initial fetch only); pull-to-refresh keeps its native spinner.
 *
 * @param props.count - Number of skeleton cards to render. Defaults to 4.
 *
 * @example
 * <PensionerStatementListSkeleton count={4} />
 */
export function PensionerStatementListSkeleton({ count = 4 }: PensionerStatementListSkeletonProps) {
  return (
    <View className="gap-3 pb-20">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="gap-3 rounded-md border border-gray-200 bg-card p-4">
          {/* Header: date range + months chip */}
          <View className="flex-row items-center justify-between">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </View>

          {/* Summary rows: Basic Pension, DA, Net amount */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-16 rounded-md" />
            </View>
            <View className="flex-row items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-16 rounded-md" />
            </View>
            {/* Net amount row with top border */}
            <View className="flex-row items-center justify-between border-t border-gray-100 pt-2">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </View>
          </View>

          {/* Toggle line */}
          <View className="items-center">
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </View>
        </View>
      ))}
    </View>
  );
}
