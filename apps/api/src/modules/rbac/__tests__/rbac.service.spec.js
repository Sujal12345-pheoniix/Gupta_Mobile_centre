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
var common_1 = require("@nestjs/common");
var rbac_service_1 = require("../rbac.service");
var prisma_service_1 = require("../../../common/prisma.service");
describe('RbacService', function () {
    var service;
    var mockPrismaService = {
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
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        providers: [
                            rbac_service_1.RbacService,
                            { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                        ],
                    }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(rbac_service_1.RbacService);
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getRoles', function () {
        it('should return all roles with permissions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRoles, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRoles = [
                            { id: 'role-1', name: 'Admin', permissions: [] },
                            { id: 'role-2', name: 'Staff', permissions: [] },
                        ];
                        mockPrismaService.role.findMany.mockResolvedValue(mockRoles);
                        return [4 /*yield*/, service.getRoles('org-1')];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual(mockRoles);
                        expect(mockPrismaService.role.findMany).toHaveBeenCalledWith(expect.objectContaining({
                            include: expect.any(Object),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createRole', function () {
        it('should throw ConflictException if role name exists', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'Admin' });
                        return [4 /*yield*/, expect(service.createRole('org-1', { name: 'Admin' })).rejects.toThrow(common_1.ConflictException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should create role with permissions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.role.findUnique.mockResolvedValue(null);
                        mockPrismaService.role.create.mockResolvedValue({
                            id: 'role-1',
                            name: 'Custom',
                            permissions: [],
                        });
                        return [4 /*yield*/, service.createRole('org-1', {
                                name: 'Custom',
                                permissionIds: ['perm-1', 'perm-2'],
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveProperty('id', 'role-1');
                        expect(mockPrismaService.role.create).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('assignRoleToUser', function () {
        it('should throw NotFoundException if user not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.user.findUnique.mockResolvedValue(null);
                        return [4 /*yield*/, expect(service.assignRoleToUser('user-1', { userId: 'user-1', roleId: 'role-1' })).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException if role not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
                        mockPrismaService.role.findUnique.mockResolvedValue(null);
                        return [4 /*yield*/, expect(service.assignRoleToUser('user-1', { userId: 'user-1', roleId: 'role-1' })).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw ConflictException if user already has role', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
                        mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-1' });
                        mockPrismaService.userRole.findUnique.mockResolvedValue({
                            userId: 'user-1',
                            roleId: 'role-1',
                        });
                        return [4 /*yield*/, expect(service.assignRoleToUser('user-1', { userId: 'user-1', roleId: 'role-1' })).rejects.toThrow(common_1.ConflictException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should assign role to user successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
                        mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-1' });
                        mockPrismaService.userRole.findUnique.mockResolvedValue(null);
                        mockPrismaService.userRole.create.mockResolvedValue({
                            userId: 'user-1',
                            roleId: 'role-1',
                        });
                        return [4 /*yield*/, service.assignRoleToUser('user-1', {
                                userId: 'user-1',
                                roleId: 'role-1',
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveProperty('userId', 'user-1');
                        expect(result).toHaveProperty('roleId', 'role-1');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('hasPermission', function () {
        it('should return true if user has permission', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        return [4 /*yield*/, service.hasPermission('user-1', 'products.view')];
                    case 1:
                        result = _a.sent();
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if user does not have permission', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        return [4 /*yield*/, service.hasPermission('user-1', 'products.create')];
                    case 1:
                        result = _a.sent();
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
