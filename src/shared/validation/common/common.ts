import { z } from 'zod';

import { PAGE_SIZE } from '@utils/constants/common';
import { ALLOW_REGEX } from '@utils/helpers/regex-patterns/regex-patterns';

export const uuidValidation = z.uuid('Invalid ID');

export const pageSizeValidation = z.coerce
  .number({
    error: 'Page size must be a number',
  })
  .int('Page size must be an integer')
  .min(1, 'Minimum page size is 1')
  .max(50, 'Maximum page size is 50')
  .positive('Page size must be positive')
  .catch(PAGE_SIZE);

export const pageNumberValidation = z.coerce
  .number({
    error: 'Page number must be a number',
  })
  .int('Page number must be an integer')
  .min(1, 'Minimum page number is 1')
  .max(1000, 'Maximum page number is 1000')
  .positive('Page number must be positive')
  .catch(1);

export const passwordValidation = z
  .string('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(50, 'Password must be at most 50 characters');

/**
 * Validates a PPO number / username string against the allowed-character
 * regex (ALLOW_REGEX.USERNAME) and trims the result. Shared by the login
 * and registration validators.
 */
export const ppoNoValidation = (message?: string) =>
  z
    .string(`${message || 'PPO No'} is Required`)
    .regex(ALLOW_REGEX.USERNAME, `Invalid ${message || 'PPO No'}`)
    .trim();
