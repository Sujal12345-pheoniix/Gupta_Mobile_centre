import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserInput, UpdateUserInput, ChangePasswordInput } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly authService: AuthService,
  ) {}

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
        roles: {
          include: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      include: {
        employee: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(
    organizationId: string,
    branchId: string,
    actorId: string,
    input: CreateUserInput,
  ) {
    const { email, phone, password, name, roleIds } = input;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }

    // Check for existing user
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (existing) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = password
      ? await this.authService.hashPassword(password)
      : await this.authService.hashPassword('Welcome@123'); // Default password

    // Create user with employee
    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: email || null,
        phone: phone || null,
        passwordHash,
        status: 'ACTIVE',
        employee: {
          create: {
            organizationId,
            branchId,
            employeeCode: `EMP${Date.now()}`,
            name,
            joiningDate: new Date(),
            status: 'ACTIVE',
          },
        },
      },
      include: {
        employee: true,
        roles: true,
      },
    });

    // Assign roles
    if (roleIds?.length) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId: user.id,
          roleId,
        })),
      });
    }

    // Log audit event
    await this.auditService.log({
      organizationId,
      actorId,
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      afterData: { email, phone, name },
    });

    return this.findById(user.id, organizationId);
  }

  async update(
    id: string,
    organizationId: string,
    actorId: string,
    input: UpdateUserInput,
  ) {
    const { email, phone, name } = input;

    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for duplicate email/phone
    if (email || phone) {
      const existing = await this.prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            email ? { email } : undefined,
            phone ? { phone } : undefined,
          ].filter(Boolean) as any,
        },
      });

      if (existing) {
        throw new ConflictException('Email or phone already in use');
      }
    }

    // Update user
    await this.prisma.user.update({
      where: { id },
      data: { email, phone },
    });

    // Update employee name if provided
    if (name && user.employee) {
      await this.prisma.employee.update({
        where: { id: user.employee.id },
        data: { name },
      });
    }

    // Log audit event
    await this.auditService.log({
      organizationId,
      actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      afterData: { email, phone, name },
    });

    return this.findById(id, organizationId);
  }

  async deactivate(id: string, organizationId: string, actorId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'INACTIVE') {
      throw new BadRequestException('User is already inactive');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    // Log audit event
    await this.auditService.log({
      organizationId,
      actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      beforeData: { status: 'ACTIVE' },
      afterData: { status: 'INACTIVE' },
    });

    return updated;
  }

  async activate(id: string, organizationId: string, actorId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'ACTIVE') {
      throw new BadRequestException('User is already active');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    // Log audit event
    await this.auditService.log({
      organizationId,
      actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      beforeData: { status: 'INACTIVE' },
      afterData: { status: 'ACTIVE' },
    });

    return updated;
  }

  async changePassword(
    id: string,
    organizationId: string,
    actorId: string,
    input: ChangePasswordInput,
  ) {
    const { currentPassword, newPassword } = input;

    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await this.authService.verifyPassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and update new password
    const passwordHash = await this.authService.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Log audit event
    await this.auditService.log({
      organizationId,
      actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      metadata: { action: 'PASSWORD_CHANGE' },
    });

    return { success: true };
  }

  async getBranches(organizationId: string) {
    return this.prisma.branch.findMany({
      where: { organizationId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getOrganizations() {
    return this.prisma.organization.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
