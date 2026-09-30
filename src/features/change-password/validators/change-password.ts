import { passwordValidation } from '@validation/common';
import { z } from 'zod';

export const ChangePasswrodSchema = z
  .object({
    oldPassword: passwordValidation,
    newPassword: passwordValidation,
    confirmPassword: passwordValidation,
  })
  .superRefine(({ newPassword, oldPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password and confirm password do not match.',
        path: ['confirmPassword'],
      });
    }
    if (oldPassword === newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password and old password cannot be the same.',
        path: ['newPassword'],
      });
    }
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswrodSchema>;
