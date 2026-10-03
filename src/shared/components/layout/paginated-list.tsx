import React from 'react';
import {
  FlatList,
  FlatListProps,
  RefreshControl,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Skeleton } from '@components/ui/skeleton';
import { cn } from '@utils/helpers/cn';

interface PaginatedListProps<T> extends Omit<FlatListProps<T>, 'data'> {
  /**
   * Data to be rendered (compatible with TanStack Query's page results)
   */
  data: T[] | undefined;
  /**
   * Whether the initial page is loading
   */
  isLoading?: boolean;
  /**
   * Whether a refresh is in progress
   */
  isRefreshing?: boolean;
  /**
   * Whether the next page is being fetched
   */
  isFetchingNextPage?: boolean;
  /**
   * Function to trigger when pulling to refresh
   */
  onRefresh?: () => void;
  /**
   * Function to trigger when reaching the end of the list
   */
  onEndReached?: () => void;
  /**
   * Optional custom component for empty state
   */
  ListEmptyComponent?: React.ReactElement;
  /**
   * Number of skeleton items to show during initial load
   */
  skeletonCount?: number;
  /**
   * Height of each skeleton item
   */
  skeletonHeight?: number;
}

/**
 * A production-ready List wrapper that standardizes loading,
 * refreshing, and infinite scrolling states.
 */
export function PaginatedList<T>({
  data,
  isLoading,
  isRefreshing,
  isFetchingNextPage,
  onRefresh,
  onEndReached,
  ListEmptyComponent,
  skeletonCount = 6,
  contentContainerStyle,
  className,
  ...props
}: PaginatedListProps<T>) {
  // Render Skeletons for the initial loading state
  if (isLoading && !data?.length) {
    return (
      <View className="flex-1 gap-y-4 p-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className={cn('w-full rounded-md', className)} />
        ))}
      </View>
    );
  }

  const defaultEmptyComponent = (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-center text-sm text-muted-foreground">No items found.</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => (item as any)?.id?.toString() || index.toString()}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        ) : undefined
      }
      ListEmptyComponent={ListEmptyComponent || defaultEmptyComponent}
      ListFooterComponent={renderFooter}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}
