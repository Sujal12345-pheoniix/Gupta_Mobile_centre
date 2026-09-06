import { z } from 'zod';

export const LoginDto = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export type LoginInput = z.infer<typeof LoginDto>;
