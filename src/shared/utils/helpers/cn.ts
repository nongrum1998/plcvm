import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names with proper conflict resolution.
 *
 * Combines `clsx` conditional class logic with `tailwind-merge` to intelligently
 * handle conflicting Tailwind utilities (e.g., `px-4 px-6` resolves to `px-6`).
 *
 * @param inputs - Class values (strings, objects, arrays) to merge.
 * @returns A single merged class string.
 *
 * @example
 * ```ts
 * cn('px-4', isActive && 'bg-blue-500', 'py-2') // "px-4 py-2 bg-blue-500"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
