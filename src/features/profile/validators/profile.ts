import { ALLOW_REGEX } from '@utils';
import { z } from 'zod';

/**
 * Zod schema for validating the profile update form.
 *
 * Validates the user-editable fields of a profile: `name` (1–120 chars) and
 * `username` (1–50 chars, only letters, numbers, dots, underscores, hyphens).
 */

export const ProfileUpdateSchema = z.object({
  pan_dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Please enter a valid date of birth'),

  pan_no: z
    .string()
    .trim()
    .min(1, 'PAN number is required')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Please enter a valid PAN number'),

  mobile_no: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .max(10, 'Mobile Number should be exactly 10 in number')
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
