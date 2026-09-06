import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RbacService } from '../rbac.service';
import { PrismaService } from '../../../common/prisma.service';

describe('RbacService', () => {
  let service: RbacService;

  const mockPrismaService = {
    role: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    rolePermission: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    userRole: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);

    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should return all roles with permissions', async () => {
      const mockRoles = [
        { id: 'role-1', name: 'Admin', permissions: [] },
        { id: 'role-2', name: 'Staff', permissions: [] },
      ];

      mockPrismaService.role.findMany.mockResolvedValue(mockRoles);

      const result = await service.getRoles('org-1');

      expect(result).toEqual(mockRoles);
      expect(mockPrismaService.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.any(Object),
        }),
      );
    });
  });

  describe('createRole', () => {
    it('should throw ConflictException if role name exists', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'Admin' });

      await expect(
        service.createRole('org-1', { name: 'Admin' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create role with permissions', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);
      mockPrismaService.role.create.mockResolvedValue({
        id: 'role-1',
        name: 'Custom',
        permissions: [],
      });

      const result = await service.createRole('org-1', {
        name: 'Custom',
        permissionIds: ['perm-1', 'perm-2'],
      });

      expect(result).toHaveProperty('id', 'role-1');
      expect(mockPrismaService.role.create).toHaveBeenCalled();
    });
  });

  describe('assignRoleToUser', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser('user-1', { userId: 'user-1', roleId: 'role-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if role not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser('user-1', { userId: 'user-1', roleId: 'role-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user already has role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-1' });
      mockPrismaService.userRole.findUnique.mockResolvedValue({
        userId: 'user-1',
        roleId: 'role-1',
      });

      await expect(
        service.assignRoleToUser('user-1', { userId: 'user-1', roleId: 'role-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should assign role to user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-1' });
      mockPrismaService.userRole.findUnique.mockResolvedValue(null);
      mockPrismaService.userRole.create.mockResolvedValue({
        userId: 'user-1',
        roleId: 'role-1',
      });

      const result = await service.assignRoleToUser('user-1', {
        userId: 'user-1',
        roleId: 'role-1',
      });

      expect(result).toHaveProperty('userId', 'user-1');
      expect(result).toHaveProperty('roleId', 'role-1');
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      mockPrismaService.userRole.findMany.mockResolvedValue([
        {
          userId: 'user-1',
          role: {
            permissions: [
              { permission: { key: 'products.view' } },
              { permission: { key: 'products.create' } },
            ],
          },
        },
      ]);

      const result = await service.hasPermission('user-1', 'products.view');

      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      mockPrismaService.userRole.findMany.mockResolvedValue([
        {
          userId: 'user-1',
          role: {
            permissions: [
              { permission: { key: 'products.view' } },
            ],
          },
        },
      ]);

      const result = await service.hasPermission('user-1', 'products.create');

      expect(result).toBe(false);
    });
  });
});
