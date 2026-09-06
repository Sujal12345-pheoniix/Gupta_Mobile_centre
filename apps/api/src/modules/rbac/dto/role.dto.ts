import { z } from 'zod';

export const CreateRoleDto = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().max(200).optional(),
  permissionIds: z.array(z.string().cuid()).optional(),
});

export type CreateRoleInput = z.infer<typeof CreateRoleDto>;

export const UpdateRoleDto = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  permissionIds: z.array(z.string().cuid()).optional(),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleDto>;

export const AssignRoleDto = z.object({
  userId: z.string().cuid(),
  roleId: z.string().cuid(),
});

export type AssignRoleInput = z.infer<typeof AssignRoleDto>;
