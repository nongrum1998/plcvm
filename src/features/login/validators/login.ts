import { formatPassword } from '@lib';
import { passwordValidation, ppoNoValidation } from '@validation/common';
import { z } from 'zod';

export const LoginSchema = z.object({
  username: ppoNoValidation('Username'),
  password: passwordValidation.transform((v) => formatPassword(v)),
});

export type LoginInput = z.infer<typeof LoginSchema>;
