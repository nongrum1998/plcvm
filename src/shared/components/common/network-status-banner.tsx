import { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { cn } from '@utils';

/**
 * Renders a slim, full-width connectivity banner that appears only while the
 * device is offline, then briefly confirms recovery.
 *
 * Mount it once near the top of a screen (or inside a header) to give the user
 * visible feedback that a request is failing because of connectivity rather
 * than because of the request itself. The banner occupies layout space only
 * while it is visible, so screens must not assume a fixed header offset.
 *
 * Connectivity is read from `@react-native-community/netinfo`. A device counts
 * as online only when `isConnected` is truthy **and** `isInternetReachable` is
 * not explicitly `false`; a `null` reachability (still probing) is treated as
 * online to avoid flashing the banner during startup.
 *
 * Behaviour by transition:
 *
 * - **Online to offline** — shows an amber `Offline` banner and holds it there
 *   for as long as connectivity is lost.
 * - **Offline to online** — shows a green `Back Online` banner for two
 *   seconds, then removes itself.
 * - **Online to online** — stays hidden, so mounting this on every screen is
 *   safe and does not produce a persistent chrome element.
 *
 * Any pending hide timer is cancelled when a new network state arrives, so
 * rapid flapping (for example, toggling between a cellular and Wi-Fi access
 * point) restarts the recovery window instead of hiding the banner while the
 * user is still seeing it.
 *
 * @returns A full-width banner when offline or briefly after recovery;
 * `null` otherwise. Renders no host element while hidden.
 * @example
 * ```tsx
 * <SafeAreaView className="flex-1">
 *   <NetworkStatusBanner />
 *   <Container>...</Container>
 * </SafeAreaView>
 * ```
 */
export const NetworkStatusBanner = () => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const wasOffline = useRef<boolean>(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);

      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      if (!connected) {
        setIsOffline(true);
        setIsVisible(true);
        wasOffline.current = true;
      } else {
        setIsOffline(false);
        if (wasOffline.current) {
          setIsVisible(true);
          hideTimer.current = setTimeout(() => {
            setIsVisible(false);
            wasOffline.current = false;
          }, 2000);
        } else {
          setIsVisible(false);
        }
      }
    });

    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <View
      className={cn(
        'w-full items-center justify-center px-4 py-1.5',
        isOffline ? 'bg-amber-500' : 'bg-emerald-600'
      )}>
      <Text
        className={cn(
          isOffline ? 'text-slate-950' : 'text-white',
          'text-center text-[11px] font-semibold tracking-wide'
        )}>
        {isOffline ? 'Offline' : 'Back Online'}
      </Text>
    </View>
  );
};
