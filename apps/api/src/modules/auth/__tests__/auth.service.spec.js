"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@nestjs/testing");
var jwt_1 = require("@nestjs/jwt");
var config_1 = require("@nestjs/config");
var common_1 = require("@nestjs/common");
var auth_service_1 = require("../auth.service");
var prisma_service_1 = require("../../../common/prisma.service");
var bcrypt = require("bcrypt");
describe('AuthService', function () {
    var service;
    var prisma;
    var jwtService;
    var mockPrismaService = {
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
    var mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
    };
    var mockConfigService = {
        get: jest.fn().mockImplementation(function (key) {
            var config = {
                JWT_SECRET: 'test-jwt-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
            };
            return config[key];
        }),
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        providers: [
                            auth_service_1.AuthService,
                            { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                            { provide: jwt_1.JwtService, useValue: mockJwtService },
                            { provide: config_1.ConfigService, useValue: mockConfigService },
                        ],
                    }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(auth_service_1.AuthService);
                    prisma = module.get(prisma_service_1.PrismaService);
                    jwtService = module.get(jwt_1.JwtService);
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('login', function () {
        it('should throw UnauthorizedException when user not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.user.findFirst.mockResolvedValue(null);
                        return [4 /*yield*/, expect(service.login({
                                email: 'test@example.com',
                                password: 'password123',
                            })).rejects.toThrow(common_1.UnauthorizedException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException when user is inactive', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = (_a = mockPrismaService.user.findFirst).mockResolvedValue;
                        _c = {
                            id: 'user-1',
                            email: 'test@example.com',
                            status: 'INACTIVE'
                        };
                        return [4 /*yield*/, bcrypt.hash('password123', 10)];
                    case 1:
                        _b.apply(_a, [(_c.passwordHash = _d.sent(),
                                _c.organization = { name: 'Test Org' },
                                _c.roles = [],
                                _c)]);
                        return [4 /*yield*/, expect(service.login({
                                email: 'test@example.com',
                                password: 'password123',
                            })).rejects.toThrow(common_1.UnauthorizedException)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException when password is incorrect', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = (_a = mockPrismaService.user.findFirst).mockResolvedValue;
                        _c = {
                            id: 'user-1',
                            email: 'test@example.com',
                            status: 'ACTIVE'
                        };
                        return [4 /*yield*/, bcrypt.hash('correctpassword', 10)];
                    case 1:
                        _b.apply(_a, [(_c.passwordHash = _d.sent(),
                                _c.organization = { name: 'Test Org' },
                                _c.roles = [],
                                _c)]);
                        return [4 /*yield*/, expect(service.login({
                                email: 'test@example.com',
                                password: 'wrongpassword',
                            })).rejects.toThrow(common_1.UnauthorizedException)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return user and tokens on successful login', function () { return __awaiter(void 0, void 0, void 0, function () {
            var passwordHash, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcrypt.hash('password123', 10)];
                    case 1:
                        passwordHash = _a.sent();
                        mockPrismaService.user.findFirst.mockResolvedValue({
                            id: 'user-1',
                            email: 'test@example.com',
                            phone: null,
                            status: 'ACTIVE',
                            passwordHash: passwordHash,
                            organizationId: 'org-1',
                            organization: { name: 'Test Org' },
                            employee: { name: 'Test User' },
                            roles: [],
                        });
                        mockPrismaService.user.update.mockResolvedValue({});
                        mockJwtService.sign.mockReturnValue('mock-token');
                        return [4 /*yield*/, service.login({
                                email: 'test@example.com',
                                password: 'password123',
                            })];
                    case 2:
                        result = _a.sent();
                        expect(result).toHaveProperty('user');
                        expect(result).toHaveProperty('tokens');
                        expect(result.tokens.accessToken).toBe('mock-token');
                        expect(result.tokens.refreshToken).toBe('mock-token');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('validateUser', function () {
        it('should return null for refresh token type', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.validateUser({
                            sub: 'user-1',
                            organizationId: 'org-1',
                            roleIds: [],
                            type: 'refresh',
                        })];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return null when user not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.user.findUnique.mockResolvedValue(null);
                        return [4 /*yield*/, service.validateUser({
                                sub: 'user-1',
                                organizationId: 'org-1',
                                roleIds: [],
                                type: 'access',
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return null when user is inactive', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.user.findUnique.mockResolvedValue({
                            id: 'user-1',
                            status: 'INACTIVE',
                            organization: { name: 'Test Org' },
                            employee: { name: 'Test User' },
                            roles: [],
                        });
                        return [4 /*yield*/, service.validateUser({
                                sub: 'user-1',
                                organizationId: 'org-1',
                                roleIds: [],
                                type: 'access',
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return AuthUser when validation succeeds', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        return [4 /*yield*/, service.validateUser({
                                sub: 'user-1',
                                organizationId: 'org-1',
                                roleIds: [],
                                type: 'access',
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).not.toBeNull();
                        expect(result === null || result === void 0 ? void 0 : result.id).toBe('user-1');
                        expect(result === null || result === void 0 ? void 0 : result.email).toBe('test@example.com');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('hashPassword', function () {
        it('should hash password', function () { return __awaiter(void 0, void 0, void 0, function () {
            var password, hash, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        password = 'testpassword';
                        return [4 /*yield*/, service.hashPassword(password)];
                    case 1:
                        hash = _b.sent();
                        expect(hash).not.toBe(password);
                        _a = expect;
                        return [4 /*yield*/, bcrypt.compare(password, hash)];
                    case 2:
                        _a.apply(void 0, [_b.sent()]).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('verifyPassword', function () {
        it('should return true for correct password', function () { return __awaiter(void 0, void 0, void 0, function () {
            var password, hash, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        password = 'testpassword';
                        return [4 /*yield*/, bcrypt.hash(password, 10)];
                    case 1:
                        hash = _a.sent();
                        return [4 /*yield*/, service.verifyPassword(password, hash)];
                    case 2:
                        result = _a.sent();
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for incorrect password', function () { return __awaiter(void 0, void 0, void 0, function () {
            var password, hash, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        password = 'testpassword';
                        return [4 /*yield*/, bcrypt.hash('differentpassword', 10)];
                    case 1:
                        hash = _a.sent();
                        return [4 /*yield*/, service.verifyPassword(password, hash)];
                    case 2:
                        result = _a.sent();
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
