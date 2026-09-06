"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
var common_1 = require("@nestjs/common");
var UsersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UsersService = _classThis = /** @class */ (function () {
        function UsersService_1(prisma, auditService, authService) {
            this.prisma = prisma;
            this.auditService = auditService;
            this.authService = authService;
        }
        UsersService_1.prototype.findAll = function (organizationId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.user.findMany({
                            where: { organizationId: organizationId },
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
                        })];
                });
            });
        };
        UsersService_1.prototype.findById = function (id, organizationId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { id: id, organizationId: organizationId },
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
                            })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('User not found');
                            }
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        UsersService_1.prototype.create = function (organizationId, branchId, actorId, input) {
            return __awaiter(this, void 0, void 0, function () {
                var email, phone, password, name, roleIds, existing, passwordHash, _a, user;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            email = input.email, phone = input.phone, password = input.password, name = input.name, roleIds = input.roleIds;
                            if (!email && !phone) {
                                throw new common_1.BadRequestException('Email or phone is required');
                            }
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: {
                                        OR: [
                                            email ? { email: email } : undefined,
                                            phone ? { phone: phone } : undefined,
                                        ].filter(Boolean),
                                    },
                                })];
                        case 1:
                            existing = _b.sent();
                            if (existing) {
                                throw new common_1.ConflictException('User with this email or phone already exists');
                            }
                            if (!password) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.authService.hashPassword(password)];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.authService.hashPassword('Welcome@123')];
                        case 4:
                            _a = _b.sent();
                            _b.label = 5;
                        case 5:
                            passwordHash = _a;
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: {
                                        organizationId: organizationId,
                                        email: email || null,
                                        phone: phone || null,
                                        passwordHash: passwordHash,
                                        status: 'ACTIVE',
                                        employee: {
                                            create: {
                                                organizationId: organizationId,
                                                branchId: branchId,
                                                employeeCode: "EMP".concat(Date.now()),
                                                name: name,
                                                joiningDate: new Date(),
                                                status: 'ACTIVE',
                                            },
                                        },
                                    },
                                    include: {
                                        employee: true,
                                        roles: true,
                                    },
                                })];
                        case 6:
                            user = _b.sent();
                            if (!(roleIds === null || roleIds === void 0 ? void 0 : roleIds.length)) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.prisma.userRole.createMany({
                                    data: roleIds.map(function (roleId) { return ({
                                        userId: user.id,
                                        roleId: roleId,
                                    }); }),
                                })];
                        case 7:
                            _b.sent();
                            _b.label = 8;
                        case 8: 
                        // Log audit event
                        return [4 /*yield*/, this.auditService.log({
                                organizationId: organizationId,
                                actorId: actorId,
                                action: 'CREATE',
                                entityType: 'User',
                                entityId: user.id,
                                afterData: { email: email, phone: phone, name: name },
                            })];
                        case 9:
                            // Log audit event
                            _b.sent();
                            return [2 /*return*/, this.findById(user.id, organizationId)];
                    }
                });
            });
        };
        UsersService_1.prototype.update = function (id, organizationId, actorId, input) {
            return __awaiter(this, void 0, void 0, function () {
                var email, phone, name, user, existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            email = input.email, phone = input.phone, name = input.name;
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: { id: id, organizationId: organizationId },
                                    include: { employee: true },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('User not found');
                            }
                            if (!(email || phone)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: {
                                        id: { not: id },
                                        OR: [
                                            email ? { email: email } : undefined,
                                            phone ? { phone: phone } : undefined,
                                        ].filter(Boolean),
                                    },
                                })];
                        case 2:
                            existing = _a.sent();
                            if (existing) {
                                throw new common_1.ConflictException('Email or phone already in use');
                            }
                            _a.label = 3;
                        case 3: 
                        // Update user
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: id },
                                data: { email: email, phone: phone },
                            })];
                        case 4:
                            // Update user
                            _a.sent();
                            if (!(name && user.employee)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.employee.update({
                                    where: { id: user.employee.id },
                                    data: { name: name },
                                })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: 
                        // Log audit event
                        return [4 /*yield*/, this.auditService.log({
                                organizationId: organizationId,
                                actorId: actorId,
                                action: 'UPDATE',
                                entityType: 'User',
                                entityId: id,
                                afterData: { email: email, phone: phone, name: name },
                            })];
                        case 7:
                            // Log audit event
                            _a.sent();
                            return [2 /*return*/, this.findById(id, organizationId)];
                    }
                });
            });
        };
        UsersService_1.prototype.deactivate = function (id, organizationId, actorId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { id: id, organizationId: organizationId },
                            })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('User not found');
                            }
                            if (user.status === 'INACTIVE') {
                                throw new common_1.BadRequestException('User is already inactive');
                            }
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: id },
                                    data: { status: 'INACTIVE' },
                                })];
                        case 2:
                            updated = _a.sent();
                            // Log audit event
                            return [4 /*yield*/, this.auditService.log({
                                    organizationId: organizationId,
                                    actorId: actorId,
                                    action: 'UPDATE',
                                    entityType: 'User',
                                    entityId: id,
                                    beforeData: { status: 'ACTIVE' },
                                    afterData: { status: 'INACTIVE' },
                                })];
                        case 3:
                            // Log audit event
                            _a.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        UsersService_1.prototype.activate = function (id, organizationId, actorId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { id: id, organizationId: organizationId },
                            })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('User not found');
                            }
                            if (user.status === 'ACTIVE') {
                                throw new common_1.BadRequestException('User is already active');
                            }
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: id },
                                    data: { status: 'ACTIVE' },
                                })];
                        case 2:
                            updated = _a.sent();
                            // Log audit event
                            return [4 /*yield*/, this.auditService.log({
                                    organizationId: organizationId,
                                    actorId: actorId,
                                    action: 'UPDATE',
                                    entityType: 'User',
                                    entityId: id,
                                    beforeData: { status: 'INACTIVE' },
                                    afterData: { status: 'ACTIVE' },
                                })];
                        case 3:
                            // Log audit event
                            _a.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        UsersService_1.prototype.changePassword = function (id, organizationId, actorId, input) {
            return __awaiter(this, void 0, void 0, function () {
                var currentPassword, newPassword, user, isValid, passwordHash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            currentPassword = input.currentPassword, newPassword = input.newPassword;
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: { id: id, organizationId: organizationId },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('User not found');
                            }
                            return [4 /*yield*/, this.authService.verifyPassword(currentPassword, user.passwordHash)];
                        case 2:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new common_1.BadRequestException('Current password is incorrect');
                            }
                            return [4 /*yield*/, this.authService.hashPassword(newPassword)];
                        case 3:
                            passwordHash = _a.sent();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: id },
                                    data: { passwordHash: passwordHash },
                                })];
                        case 4:
                            _a.sent();
                            // Log audit event
                            return [4 /*yield*/, this.auditService.log({
                                    organizationId: organizationId,
                                    actorId: actorId,
                                    action: 'UPDATE',
                                    entityType: 'User',
                                    entityId: id,
                                    metadata: { action: 'PASSWORD_CHANGE' },
                                })];
                        case 5:
                            // Log audit event
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        UsersService_1.prototype.getBranches = function (organizationId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.branch.findMany({
                            where: { organizationId: organizationId, isActive: true },
                            orderBy: { name: 'asc' },
                        })];
                });
            });
        };
        UsersService_1.prototype.getOrganizations = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.organization.findMany({
                            orderBy: { name: 'asc' },
                        })];
                });
            });
        };
        return UsersService_1;
    }());
    __setFunctionName(_classThis, "UsersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
}();
exports.UsersService = UsersService;
