import { z } from 'zod';

export const ForgotPasswordDto = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordDto>;
