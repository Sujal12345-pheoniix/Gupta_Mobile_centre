import { z } from 'zod';

export const ResetPasswordDto = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordDto>;
