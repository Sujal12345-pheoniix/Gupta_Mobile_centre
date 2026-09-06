import { z } from 'zod';

export const CreateUserDto = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1),
  roleIds: z.array(z.string().cuid()).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  name: z.string().min(1).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserDto>;

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordDto>;
