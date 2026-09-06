import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService, AuthUser } from '../auth.service';
import { PrismaService } from '../../../common/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    branch: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
    employee: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-jwt-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        status: 'INACTIVE',
        passwordHash: await bcrypt.hash('password123', 10),
        organization: { name: 'Test Org' },
        roles: [],
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        status: 'ACTIVE',
        passwordHash: await bcrypt.hash('correctpassword', 10),
        organization: { name: 'Test Org' },
        roles: [],
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and tokens on successful login', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        phone: null,
        status: 'ACTIVE',
        passwordHash,
        organizationId: 'org-1',
        organization: { name: 'Test Org' },
        employee: { name: 'Test User' },
        roles: [],
      });
      mockPrismaService.user.update.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens.accessToken).toBe('mock-token');
      expect(result.tokens.refreshToken).toBe('mock-token');
    });
  });

  describe('validateUser', () => {
    it('should return null for refresh token type', async () => {
      const result = await service.validateUser({
        sub: 'user-1',
        organizationId: 'org-1',
        roleIds: [],
        type: 'refresh',
      });

      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser({
        sub: 'user-1',
        organizationId: 'org-1',
        roleIds: [],
        type: 'access',
      });

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        status: 'INACTIVE',
        organization: { name: 'Test Org' },
        employee: { name: 'Test User' },
        roles: [],
      });

      const result = await service.validateUser({
        sub: 'user-1',
        organizationId: 'org-1',
        roleIds: [],
        type: 'access',
      });

      expect(result).toBeNull();
    });

    it('should return AuthUser when validation succeeds', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        phone: null,
        status: 'ACTIVE',
        organizationId: 'org-1',
        organization: { name: 'Test Org' },
        employee: { name: 'Test User' },
        roles: [],
      });

      const result = await service.validateUser({
        sub: 'user-1',
        organizationId: 'org-1',
        roleIds: [],
        type: 'access',
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe('user-1');
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testpassword';
      const hash = await service.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(await bcrypt.compare(password, hash)).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testpassword';
      const hash = await bcrypt.hash(password, 10);

      const result = await service.verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'testpassword';
      const hash = await bcrypt.hash('differentpassword', 10);

      const result = await service.verifyPassword(password, hash);
      expect(result).toBe(false);
    });
  });
});
