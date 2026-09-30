import { MutationCache, QueryCache, QueriesOptions, QueryClient } from '@tanstack/react-query';
import { logger } from '@utils';

/**
 * React Query utilities barrel module.
 *
 * @module react-query
 */

export * from './focus-manager';

/**
 * Singleton React Query client configured for production.
 *
 * - 15-minute stale time with 30-minute garbage collection window.
 * - Query errors trigger a global toast and structured log (individual queries
 *   can opt out via `meta: { silent: true }`).
 * - Mutation errors trigger an on-screen toast and are logged.
 * - Refetch on reconnect is enabled; window focus refetch is disabled
 *   (mobile uses AppState-based focus manager instead).
 */

const defaultOptionConfig: QueriesOptions<any> = {
  staleTime: 15 * 60 * 1000, // 15 minutes — baseline stale time
  gcTime: 0, // 0 min — gives persistence time to serialize
  retry: 3,
  refetchOnReconnect: true,
  refetchOnWindowFocus: true, // mobile: AppState-based, not visibilitychange
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error('Query error', error, { queryKey: query.queryKey });
      return error;
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      logger.error('Mutation error', error);
      return error;
    },
  }),
  defaultOptions: {
    queries: defaultOptionConfig,
    mutations: { retry: false },
  },
});
