import { useState } from 'react';

/**
 * Custom hook to manage a temporary "delayed" state.
 *
 * Useful for providing visual feedback during asynchronous actions (like a brief loading spinner
 * or a "success" state) that should persist for a minimum duration.
 *
 * @param {number} ms - The delay duration in milliseconds. Defaults to 1000.
 * @returns {Object} An object containing:
 *   - `trigger`: A function that sets `isDelayed` to true and returns a promise that resolves after `ms`.
 *   - `isDelayed`: A boolean indicating if the delay is currently active.
 *
 * @example
 * ```tsx
 * const { trigger, isDelayed } = useDelay(2000);
 *
 * const handleClick = async () => {
 *   await trigger();
 *   console.log('Delay finished');
 * };
 * ```
 */
export const useDelay = (ms: number = 1000) => {
  const [isDelayed, setIsDelayed] = useState(false);

  /**
   * Activates the delay state.
   * @returns {Promise<void>} A promise that resolves when the delay period has elapsed.
   */
  const trigger = () => {
    setIsDelayed(true);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsDelayed(false);
        resolve();
      }, ms);
    });
  };

  return {
    trigger,
    isDelayed,
  };
};
