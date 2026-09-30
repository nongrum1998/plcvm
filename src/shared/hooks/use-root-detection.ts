import { useEffect, useState } from 'react';
import JailMonkey from 'jail-monkey';

/**
 * Result of the device integrity checks performed by {@link useRootDetection}.
 */
export interface RootDetectionStatus {
  /** True while the native jailbreak/debugger checks are still running. */
  isChecking: boolean;
  /** True when the device is jailbroken (iOS) or rooted (Android). */
  isJailBroken: boolean;
  /** True when a debugger is attached to the running app process. */
  isDebugged: boolean;
  /** True when the app must be blocked (rooted or debugged, production only). */
  isBlocked: boolean;
}

/**
 * Detects whether the app is running on a compromised device.
 *
 * In development (`__DEV__`) every check is skipped and `isBlocked` is always
 * `false`. In production the hook runs two checks via `jail-monkey`:
 *
 * 1. `JailMonkey.isJailBroken()` — synchronous jailbreak/root detection.
 * 2. `JailMonkey.isDebuggedMode()` — async debugger-attachment detection
 *    (`P_TRACED` on iOS, `Debug.isDebuggerConnected`/`FLAG_DEBUGGABLE` on
 *    Android).
 *
 * The gate **fails closed**: if a native check throws (e.g. the module is not
 * linked in the release binary) the corresponding flag is set to `true` so an
 * unverifiable device is treated as compromised rather than trusted.
 *
 * @example
 * const { isChecking, isBlocked } = useRootDetection();
 */
export const useRootDetection = (): RootDetectionStatus => {
  const [state, setState] = useState(() => {
    if (__DEV__) {
      return { isJailBroken: false, isDebugged: false, isChecking: false };
    }

    let jailBroken = false;
    try {
      jailBroken = JailMonkey.isJailBroken();
    } catch {
      // Fail closed: inability to verify integrity is treated as jailbroken.
      jailBroken = true;
    }

    // If the device is already jailbroken there is no async check to run;
    // isChecking resolves to false immediately.
    return { isJailBroken: jailBroken, isDebugged: false, isChecking: !jailBroken };
  });

  useEffect(() => {
    // Never gate development builds — the app must run freely in dev.
    if (__DEV__) return;
    // Jailbroken already detected synchronously in the initializer; nothing
    // async to do.
    if (state.isJailBroken) return;

    let cancelled = false;

    JailMonkey.isDebuggedMode()
      .then((debugged) => {
        if (!cancelled) setState((s) => ({ ...s, isDebugged: debugged, isChecking: false }));
      })
      .catch(() => {
        // Fail closed: inability to verify debugger state is treated as debugged.
        if (!cancelled) setState((s) => ({ ...s, isDebugged: true, isChecking: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [state.isJailBroken]);

  return {
    isChecking: state.isChecking,
    isJailBroken: state.isJailBroken,
    isDebugged: state.isDebugged,
    isBlocked: !__DEV__ && (state.isJailBroken || state.isDebugged),
  };
};
