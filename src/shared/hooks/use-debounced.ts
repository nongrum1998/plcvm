import React from 'react';

/**
 * Returns a debounced copy of the provided value.
 *
 * The returned value only updates after the specified `delay` in
 * milliseconds has elapsed since the last change to `value`. This is
 * useful for delaying expensive operations (e.g., API calls, search
 * filtering) until the user stops typing.
 *
 * The internal timer is reset on every call to render where `value` or
 * `delay` has changed. If the component unmounts while a timer is
 * pending, the timer is cleaned up to prevent updating unmounted state.
 *
 * @typeParam T - The type of the value being debounced.
 * @param value  - The source value to debounce.
 * @param delay  - Debounce wait time in milliseconds.
 * @returns The debounced value (lags behind `value` by `delay` ms).
 *
 * @example
 * ```tsx
 * const [search, setSearch] = React.useState('');
 * const debouncedSearch = useDebouncedValue(search, 300);
 *
 * // debouncedSearch is safe to pass to a search API —
 * // it only updates after 300ms of inactivity.
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
