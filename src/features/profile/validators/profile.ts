import { ALLOW_REGEX } from '@utils/helpers/regex-patterns/regex-patterns';
import { isFutureDate, isRealCalendarDate } from '@utils/helpers/date/date-utils';
import { z } from 'zod';

/** Matches a date typed as `DD/MM/YYYY` — day, slash, month, slash, four-digit year. */
const DD_MM_YYYY = /^\d{2}\/\d{2}\/\d{4}$/;

/**
 * Reports whether a `DD/MM/YYYY` string is a real calendar date.
 *
 * `Date.parse` is unusable here: it interprets `DD/MM/YYYY` as `MM/DD/YYYY`, so
 * `25/08/1990` returns `NaN` and `05/08/1990` is silently read as 8 May. This
 * splits the string explicitly and rebuilds the date, so the day and month are
 * never swapped.
 *
 * @param value - A string expected to be formatted as `DD/MM/YYYY`.
 * @returns `true` when `value` matches the format and names a date that exists
 *   in the Gregorian calendar (leap years included).
 */

/**
 * Zod schema for validating the profile update form.
 *
 * Covers the fields the `update_profile` endpoint accepts: `email`, `pan_dob`
 * (typed as `DD/MM/YYYY`), `pan_no`, `mobile_no`, `height`, `gender`,
 * `comty_cd`, `marital_cd` and `religion_cd`, plus an optional `image`. The
 * coded fields are fed from option lists in `../utils/constants/profile-options`.
 *
 * Unknown keys are stripped rather than rejected, so the payload sent to the
 * API contains exactly these six fields.
 *
 * Ordering note: every text field chains `.trim()` **before** `.min(1)`. Zod
 * runs checks in chain order against the value as it stands, so the reverse
 * order measures the untrimmed input — a whitespace-only value such as `'   '`
 * passes `.min(1)` (it is three characters long) and is then trimmed to `''`,
 * silently accepting an empty submission. Trim first, then enforce the length.
 */

export const ProfileUpdateSchema = z.object({
  image: z.string('Image is required').min(1, 'Image should be at least 1 in length').optional(),
  email: z.email('Please enter a valid email'),
  pan_dob: z
    .string('Date of birth is required')
    .min(1, 'Date of birth is required')
    .refine((value) => DD_MM_YYYY.test(value), 'Please enter the date as DD/MM/YYYY')
    .refine(isRealCalendarDate, 'Please enter a valid date of birth')
    .refine((v) => !isFutureDate(v), 'Date of birth cannot be in the future'),

  pan_no: z
    .string('PAN number is required')
    .trim()
    .min(1, 'PAN number is required')
    .max(10, 'PAN number is too long')
    .regex(ALLOW_REGEX.PAN, 'Please enter a valid PAN number'),

  mobile_no: z
    .string('Mobile no is required')
    .trim()
    .min(10, 'Mobile number is required')
    // `.length` rather than `.max`: the message promises exactly 10 digits, and
    // `.max` alone let 9-digit numbers through.
    .length(10, 'Mobile Number should be exactly 10 in number')
    .regex(ALLOW_REGEX.NUMERIC_ONLY, 'Please enter a valid 10-digit mobile number'),

  height: z
    .string('Height is required')
    .trim()
    .min(1, 'Height is required')
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
      'Height must be a valid positive number'
    ),

  religion_cd: z.string('Religion is required').trim().min(1, 'Religion is required'),
  gender: z.string('Gender is required').trim().min(1, 'Gender is required'),
  comty_cd: z.string('Community is required').trim().min(1, 'Community is required'),
  marital_cd: z.string('Marital status is required').trim().min(1, 'Marital status is required'),
});

/**
 * Inferred form/payload type for the profile update screen.
 *
 * Single source of truth derived from `ProfileUpdateSchema` — used both as the
 * react-hook-form generic and as the mutation payload type sent to the update
 * endpoint.
 */
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
