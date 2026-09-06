import { z } from 'zod';

export const RegisterDto = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  organizationId: z.string().cuid().optional(),
  organizationName: z.string().min(1).optional(),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
