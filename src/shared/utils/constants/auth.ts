/**
 * Configuration for a role-protected route.
 */
export type RouteConfigT = {
  /** The route path pattern (supports wildcards like `/(admin)/*`). */
  url: string;
  /** Whether the route requires authentication. */
  needAuth: boolean;
  /** Allowed user roles for this route. */
  redirect?: string;
};

/**
 * Routes ONLY accessible when NOT authenticated (guest-only).
 * Authenticated users will be redirected away from these.
 * Examples: login, register, password reset initiation.
 */
export const GUEST_ONLY_ROUTES: string[] = [
  '/auth',
  '/auth/register',
  '/auth/reg-instruction',
] as const;

/**
 * Routes accessible by BOTH authenticated and non-authenticated users.
 * No redirects based on auth status.
 * Examples: landing pages, legal pages, public info.
 */
export const PUBLIC_ROUTES: string[] = [
  '/user-manual',
  '/privacy-policy',
  '/contact-us',
  '/about',
] as const;

/**
 * Route patterns that require authentication (protected routes).
 * Uses prefix matching for nested routes.
 * Any route not in GUEST_ONLY_ROUTES or PUBLIC_ROUTES is protected by default.
 */
export const PROTECTED_ROUTE_PATTERNS: string[] = [
  '/profile',
  '/change-password',
  '/withdrawal',
  '/face-recognition',
] as const;

/**
 * Check if a route is guest-only (accessible only when NOT authenticated).
 */
export const isGuestOnlyRoute = (pathname: string): boolean => {
  return GUEST_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Check if a route is public (accessible by both auth and non-auth users).
 */
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Check if a route is protected (requires authentication).
 */
export const isProtectedRoute = (pathname: string): boolean => {
  // Explicitly not guest-only and not public
  return !isGuestOnlyRoute(pathname) && !isPublicRoute(pathname);
};

// Backward compatibility export
/** @deprecated Use GUEST_ONLY_ROUTES, PUBLIC_ROUTES, or isProtectedRoute instead */
export const LEGACY_PUBLIC_ROUTES: string[] = [...GUEST_ONLY_ROUTES, ...PUBLIC_ROUTES] as const;
