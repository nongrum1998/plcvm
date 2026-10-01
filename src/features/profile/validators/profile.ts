import { ALLOW_REGEX } from '@utils';
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
function isRealCalendarDate(value: string): boolean {
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  // `Date` silently rolls over out-of-range components (month 13 becomes January
  // of the next year), so compare the round-tripped parts to catch that.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Zod schema for validating the profile update form.
 *
 * Covers the six fields the `update_profile` endpoint accepts: `pan_dob`
 * (typed as `DD/MM/YYYY`), `pan_no`, `mobile_no`, `height`, `comty_cd` and
 * `marital_cd`. Both coded fields are fed from option lists in
 * `../utils/constants/profile-options`.
 *
 * Unknown keys are stripped rather than rejected, so the payload sent to the
 * API contains exactly these six fields.
 */

export const ProfileUpdateSchema = z.object({
  email: z.email('Please enter a valid email'),
  religion_cd: z.string().trim().min(1, 'Religion is required'),
  gender: z.string().trim().min(1, 'Gender is required'),
  pan_dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => DD_MM_YYYY.test(value), 'Please enter the date as DD/MM/YYYY')
    .refine(isRealCalendarDate, 'Please enter a valid date of birth'),

  pan_no: z
    .string()
    .trim()
    .min(1, 'PAN number is required')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Please enter a valid PAN number'),

  mobile_no: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    // `.length` rather than `.max`: the message promises exactly 10 digits, and
    // `.max` alone let 9-digit numbers through.
    .length(10, 'Mobile Number should be exactly 10 in number')
    .regex(ALLOW_REGEX.NUMERIC_ONLY, 'Please enter a valid 10-digit mobile number'),

  height: z
    .string()
    .trim()
    .min(1, 'Height is required')
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
      'Height must be a valid positive number'
    ),

  comty_cd: z.string().trim().min(1, 'Community is required'),

  marital_cd: z.string().trim().min(1, 'Marital status is required'),
});

/**
 * Inferred form/payload type for the profile update screen.
 *
 * Single source of truth derived from `ProfileUpdateSchema` — used both as the
 * react-hook-form generic and as the mutation payload type sent to the update
 * endpoint.
 */
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
