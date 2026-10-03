import { z } from 'zod';
import { passwordValidation, ppoNoValidation } from '@validation/common/common';
import { ZodIssueCode } from 'zod/v3';
import { isFutureDate, isRealCalendarDate } from '@utils/helpers/date/date-utils';

export const RegistrationStatusSchema = z.object({
  ppo_no: ppoNoValidation('PPO Number'),
});

export type RegistrationStatusInput = z.infer<typeof RegistrationStatusSchema>;

const dateOfBirthValidation = z
  .string('Date of Birth is Required')
  .min(10, 'Date of Birth should be 10 in length')
  .refine(isRealCalendarDate, 'Please enter a valid date of birth')
  .refine((value) => !isFutureDate(value), 'Date of birth cannot be in the future')
  .trim();

const bankAccountValidation = z
  .string('Account no is Required')
  .min(4, 'Account Number should be atleast 4 in length');

export const RegisterSchema = z
  .object({
    ppo_no: ppoNoValidation('PPO Number').optional(),
    dob: dateOfBirthValidation,
    bank_accno: bankAccountValidation,
    password: passwordValidation,
    confirm_password: passwordValidation,
    image: z.string('Image is Required').optional(),
  })
  .superRefine(({ confirm_password, password }, ctx) => {
    if (password !== confirm_password) {
      return ctx.addIssue({
        code: ZodIssueCode.custom,
        path: ['confirm_password'],
        message: 'Password did not match',
      });
    }
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * Validates the payload submitted by the registration camera step
 * (step 3 of the wizard) after PPO check and details entry.
 *
 * The raw (unhashed) password is validated here; `useRegisterPensioner`
 * applies {@link formatPassword} after validation, which internally
 * SHA-256 hashes, salts, and base64-encodes it. `image` is required —
 * the camera always captures before submitting.
 */
export const RegisterPensionerSchema = z.object({
  ppo_no: ppoNoValidation('PPO Number'),
  dob: dateOfBirthValidation,
  bank_accno: bankAccountValidation,
  password: passwordValidation,
  image: z.string('Image is Required').min(1, 'Image is Required'),
});

export type RegisterPensionerInput = z.infer<typeof RegisterPensionerSchema>;
