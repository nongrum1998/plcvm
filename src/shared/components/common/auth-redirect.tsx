import { usePathname, useLocalSearchParams, Href } from 'expo-router';
import { useSafeNavigation } from '@hooks';
import React, { useEffect } from 'react';
import { LoadingScreen } from '../screens';
import { PAGE_ROUTES } from '@utils/constants';

type Props = {
  children: React.ReactNode;
  isLoading?: boolean;
  isSignedIn?: boolean;
  guestOnly?: string[];
  publicOnly?: string[];
};

/**
 * Authentication redirect guard with three-tier access control.
 *
 * Handles:
 * 1. Waiting for auth hydration/loading to complete.
 * 2. Guest-only routes: redirect authenticated users away (login, register).
 * 3. Public routes: accessible by both authenticated and non-authenticated users.
 * 4. Protected routes: redirect non-authenticated users to auth page.
 *
 * Route Categories:
 * - Guest-Only: /auth, /auth/register, /auth/reg-instruction
 * - Public: /user-manual, /privacy-policy, /contact-us, /about
 * - Protected: Everything else (requires authentication)
 */

const isGuestOnlyRoute = (pathname: string, route: string[]): boolean => {
  return route.some((route) => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Check if a route is public (accessible by both auth and non-auth users).
 */
const isPublicRoute = (pathname: string, route: string[]): boolean => {
  return route.some((route) => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Check if a route is protected (requires authentication).
 */
const isProtectedRoute = (
  pathname: string,
  routeGuest: string[],
  routePublic: string[]
): boolean => {
  // Explicitly not guest-only and not public
  return !isGuestOnlyRoute(pathname, routeGuest) && !isPublicRoute(pathname, routePublic);
};

export const AuthRedirect = ({
  children,
  isLoading = false,
  isSignedIn = false,
  guestOnly = [],
  publicOnly = [],
}: Props) => {
  const pathName = usePathname();
  const params = useLocalSearchParams();
  const { navigate } = useSafeNavigation();

  const redirectTo = params.redirect as Href;
  const redirectHref = redirectTo as Href;

  const onGuestOnlyPage = isGuestOnlyRoute(pathName, guestOnly);
  const onPublicPage = isPublicRoute(pathName, publicOnly);
  const onProtectedPage = isProtectedRoute(pathName, guestOnly, publicOnly);

  useEffect(() => {
    if (isLoading) return;

    // 1. Authenticated user on guest-only page -> redirect to home (or redirectTo)
    if (isSignedIn && onGuestOnlyPage) {
      navigate(redirectHref, 'replace');
      return;
    }

    // 2. Non-authenticated user on protected page -> redirect to auth
    if (!isSignedIn && onProtectedPage) {
      navigate(PAGE_ROUTES.AUTH.HOME, 'replace');
      return;
    }

    // 3. Public pages and authenticated users on protected pages -> allow access (no redirect)
  }, [
    isLoading,
    isSignedIn,
    onGuestOnlyPage,
    onPublicPage,
    onProtectedPage,
    pathName,
    redirectTo,
    navigate,
    redirectHref,
  ]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
