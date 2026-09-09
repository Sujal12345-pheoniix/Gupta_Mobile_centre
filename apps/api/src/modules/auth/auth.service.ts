import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './dto';

export interface JwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  organizationId: string;
  roleIds: string[];
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  organizationId: string;
  organizationName: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessTokenExpiry = 15 * 60; // 15 minutes in seconds
    this.refreshTokenExpiry = 30 * 24 * 60 * 60; // 30 days in seconds
  }

  async login(input: LoginInput): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const { email, phone, password } = input;

    // Find user by email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        organization: true,
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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Extract roles and permissions
    const roleIds = user.roles.map((ur: any) => ur.roleId as string);
    const permissions = user.roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.key as string),
    );

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.employee?.name || user.email || user.phone || 'User',
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      roles: user.roles.map((ur: any) => ur.role.name as string),
      permissions: [...new Set(permissions)] as string[],
    };

    const tokens = await this.generateTokens(authUser, roleIds);

    return { user: authUser, tokens };
  }

  async register(input: RegisterInput): Promise<{ user: AuthUser; tokens: TokenPair }> {
    const { email, phone, password, name, organizationId, organizationName } = input;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create or use existing organization
    let orgId = organizationId;
    if (!orgId && organizationName) {
      const org = await this.prisma.organization.create({
        data: {
          name: organizationName,
          timezone: 'Asia/Kolkata',
          currency: 'INR',
        },
      });
      orgId = org.id;
    }

    if (!orgId) {
      throw new ConflictException('Organization ID or name is required');
    }

    // Create branch for new org
    let branch = await this.prisma.branch.findFirst({
      where: { organizationId: orgId },
    });

    if (!branch) {
      branch = await this.prisma.branch.create({
        data: {
          organizationId: orgId,
          name: 'Head Office',
          code: 'HO',
          isActive: true,
        },
      });
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        organizationId: orgId,
        email: email || null,
        phone: phone || null,
        passwordHash,
        status: 'ACTIVE',
        employee: {
          create: {
            organizationId: orgId,
            branchId: branch.id,
            employeeCode: `EMP${Date.now()}`,
            name,
            joiningDate: new Date(),
            status: 'ACTIVE',
          },
        },
      },
      include: {
        organization: true,
        employee: true,
        roles: {
          include: { role: true },
        },
      },
    });

    // Assign default Staff role
    const staffRole = await this.prisma.role.findUnique({
      where: { name: 'Staff' },
    });

    if (staffRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: staffRole.id,
        },
      });
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.employee?.name || name,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      roles: staffRole ? [staffRole.name] : [],
      permissions: [],
    };

    const tokens = await this.generateTokens(authUser, staffRole ? [staffRole.id] : []);

    return { user: authUser, tokens };
  }

  async refreshTokens(input: RefreshTokenInput): Promise<TokenPair> {
    const { refreshToken } = input;

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          organization: true,
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

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      const roleIds = user.roles.map((ur: any) => ur.roleId as string);
      const permissions = user.roles.flatMap((ur: any) =>
        ur.role.permissions.map((rp: any) => rp.permission.key as string),
      );

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.employee?.name || user.email || 'User',
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        roles: user.roles.map((ur: any) => ur.role.name as string),
        permissions: [...new Set(permissions)] as string[],
      };

      return this.generateTokens(authUser, roleIds);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a production system, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store valid refresh tokens in Redis
    // For now, we just return success
    // The client is responsible for clearing the tokens
  }

  async validateUser(payload: JwtPayload): Promise<AuthUser | null> {
    if (payload.type !== 'access') {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        organization: true,
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

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    const permissions = user.roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.key as string),
    );

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.employee?.name || user.email || 'User',
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      roles: user.roles.map((ur: any) => ur.role.name as string),
      permissions: [...new Set(permissions)] as string[],
    };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
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
      throw new UnauthorizedException('User not found');
    }

    const permissions = user.roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.key as string),
    );

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.employee?.name || user.email || 'User',
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      roles: user.roles.map((ur: any) => ur.role.name as string),
      permissions: [...new Set(permissions)] as string[],
    };
  }

  private async generateTokens(
    user: AuthUser,
    roleIds: string[],
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      organizationId: user.organizationId,
      roleIds,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshPayload: JwtPayload = {
      ...payload,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshTokenExpiry,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiry,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
