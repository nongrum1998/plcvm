import { useCallback, useEffect, useRef } from 'react';
import { useRouter, type Href } from 'expo-router';

type NavigationMethod = 'push' | 'replace';

/** Milliseconds the navigation lock stays engaged after a call. */
const NAVIGATION_LOCK_MS = 500;

/**
 * Returns guarded `navigate` and `back` functions that prevent duplicate
 * navigation caused by rapid taps (double-click) and protect against
 * calling back() when there is no screen to go back to.
 *
 * Both functions share a single per-component-instance lock: after the
 * first call, subsequent calls within NAVIGATION_LOCK_MS are ignored.
 * The pending lock release is cancelled automatically when the component
 * unmounts, and any synchronous navigation throw is swallowed (the lock
 * still releases on its own timer).
 *
 * `navigate(href, method)` performs a push by default, or a replace when
 * method is 'replace'. `back()` only navigates when the router reports a
 * previous screen (router.canGoBack()).
 *
 * @returns An object with `navigate` and `back`. Both return true when
 * navigation was actually performed, false when it was skipped (locked,
 * no history, or a thrown navigation error).
 */
export const useSafeNavigation = () => {
  const router = useRouter();
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const release = useCallback(() => {
    locked.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const navigate = useCallback(
    (href: Href, method: NavigationMethod = 'push'): boolean => {
      if (locked.current) return false;
      locked.current = true;
      timer.current = setTimeout(release, NAVIGATION_LOCK_MS);
      try {
        router[method](href);
        return true;
      } catch {
        return false;
      }
    },
    [router, release]
  );

  const back = useCallback((): boolean => {
    if (locked.current) return false;
    if (!router.canGoBack()) return false;
    locked.current = true;
    timer.current = setTimeout(release, NAVIGATION_LOCK_MS);
    router.back();
    return true;
  }, [router, release]);

  return { navigate, back };
};
