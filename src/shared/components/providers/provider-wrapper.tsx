import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { AuthRedirect } from '../common/auth-redirect';
import { GlobalErrorBoundary } from './errors/global-error-boundary';
import { LocationProvider } from './location/location-provider';
import { TQueryProvider } from './query/query-provider';
import { RootProvider } from './root/root-provider';

// Internal Providers
import { AuthInitializer } from './auth-provider';
// Shared Components & Redirects
import { UpdateModal } from './update-modal';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { queryClient } from '@utils/react-query/query-client';
import { GUEST_ONLY_ROUTES, PUBLIC_ROUTES } from '@utils/constants/auth';
import { useAuthStore } from '@stores/auth.store';
import { CameraProvider } from './camera/camera-provider';

type Props = {
  children: React.ReactNode;
};

/**
 * Global Provider Wrapper
 *
 * Consolidates all application-wide providers into a single optimized tree.
 * Hierarchy follows a dependency-first approach:
 * 1. Low-level Infrastructure (Gestures, SafeArea, SSL, Updates)
 * 2. Data & State Management (Query, Theme)
 * 3. Domain Contexts (Auth, Notifications)
 * 4. Navigation & Security Gates (LocalAuth, AuthRedirect)
 */
export const ProviderWrapper = ({ children }: Props) => {
  // Prevent user from taking screen shot or screen recording
  usePreventScreenCapture();
  const { isSignedIn, isAuthLoading } = useAuthStore();
  return (
    <GlobalErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider className="flex-1">
          <StatusBar style="auto" animated />
          <TQueryProvider queryClient={queryClient}>
            <QueryErrorResetBoundary>
              <AuthInitializer>
                <AuthRedirect
                  isSignedIn={isSignedIn}
                  isLoading={isAuthLoading}
                  guestOnly={GUEST_ONLY_ROUTES}
                  publicOnly={PUBLIC_ROUTES}>
                  <RootProvider>
                    <LocationProvider>
                      <CameraProvider>
                        {children}
                        <UpdateModal />
                      </CameraProvider>
                    </LocationProvider>
                  </RootProvider>
                </AuthRedirect>
              </AuthInitializer>
            </QueryErrorResetBoundary>
          </TQueryProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </GlobalErrorBoundary>
  );
};
