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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
var common_1 = require("@nestjs/common");
var RbacService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RbacService = _classThis = /** @class */ (function () {
        function RbacService_1(prisma) {
            this.prisma = prisma;
        }
        // ============ Roles ============
        RbacService_1.prototype.getRoles = function (organizationId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.role.findMany({
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        })];
                });
            });
        };
        RbacService_1.prototype.getRole = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var role;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.role.findUnique({
                                where: { id: id },
                                include: {
                                    permissions: {
                                        include: { permission: true },
                                    },
                                },
                            })];
                        case 1:
                            role = _a.sent();
                            if (!role) {
                                throw new common_1.NotFoundException('Role not found');
                            }
                            return [2 /*return*/, role];
                    }
                });
            });
        };
        RbacService_1.prototype.createRole = function (organizationId, input) {
            return __awaiter(this, void 0, void 0, function () {
                var name, description, permissionIds, existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            name = input.name, description = input.description, permissionIds = input.permissionIds;
                            return [4 /*yield*/, this.prisma.role.findUnique({
                                    where: { name: name },
                                })];
                        case 1:
                            existing = _a.sent();
                            if (existing) {
                                throw new common_1.ConflictException('Role with this name already exists');
                            }
                            return [2 /*return*/, this.prisma.role.create({
                                    data: {
                                        name: name,
                                        description: description,
                                        permissions: (permissionIds === null || permissionIds === void 0 ? void 0 : permissionIds.length)
                                            ? {
                                                create: permissionIds.map(function (id) { return ({
                                                    permissionId: id,
                                                }); }),
                                            }
                                            : undefined,
                                    },
                                    include: {
                                        permissions: {
                                            include: { permission: true },
                                        },
                                    },
                                })];
                    }
                });
            });
        };
        RbacService_1.prototype.updateRole = function (id, input) {
            return __awaiter(this, void 0, void 0, function () {
                var name, description, permissionIds, existing, duplicate;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            name = input.name, description = input.description, permissionIds = input.permissionIds;
                            return [4 /*yield*/, this.prisma.role.findUnique({
                                    where: { id: id },
                                })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) {
                                throw new common_1.NotFoundException('Role not found');
                            }
                            if (!(name && name !== existing.name)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.role.findUnique({
                                    where: { name: name },
                                })];
                        case 2:
                            duplicate = _a.sent();
                            if (duplicate) {
                                throw new common_1.ConflictException('Role with this name already exists');
                            }
                            _a.label = 3;
                        case 3:
                            if (!(permissionIds !== undefined)) return [3 /*break*/, 6];
                            // Remove existing permissions
                            return [4 /*yield*/, this.prisma.rolePermission.deleteMany({
                                    where: { roleId: id },
                                })];
                        case 4:
                            // Remove existing permissions
                            _a.sent();
                            if (!(permissionIds.length > 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.rolePermission.createMany({
                                    data: permissionIds.map(function (permissionId) { return ({
                                        roleId: id,
                                        permissionId: permissionId,
                                    }); }),
                                })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/, this.prisma.role.update({
                                where: { id: id },
                                data: {
                                    name: name,
                                    description: description,
                                },
                                include: {
                                    permissions: {
                                        include: { permission: true },
                                    },
                                },
                            })];
                    }
                });
            });
        };
        // ============ Permissions ============
        RbacService_1.prototype.getPermissions = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.permission.findMany({
                            orderBy: { key: 'asc' },
                        })];
                });
            });
        };
        RbacService_1.prototype.getPermission = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var permission;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.permission.findUnique({
                                where: { id: id },
                            })];
                        case 1:
                            permission = _a.sent();
                            if (!permission) {
                                throw new common_1.NotFoundException('Permission not found');
                            }
                            return [2 /*return*/, permission];
                    }
                });
            });
        };
        // ============ User Roles ============
        RbacService_1.prototype.getUserRoles = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.userRole.findMany({
                            where: { userId: userId },
                            include: {
                                role: {
                                    include: {
                                        permissions: {
                                            include: { permission: true },
                                        },
                                    },
                                },
                            },
                        })];
                });
            });
        };
        RbacService_1.prototype.assignRoleToUser = function (userId, input) {
            return __awaiter(this, void 0, void 0, function () {
                var roleId, user, role, existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            roleId = input.roleId;
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: userId },
                                })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException('User not found');
                            }
                            return [4 /*yield*/, this.prisma.role.findUnique({
                                    where: { id: roleId },
                                })];
                        case 2:
                            role = _a.sent();
                            if (!role) {
                                throw new common_1.NotFoundException('Role not found');
                            }
                            return [4 /*yield*/, this.prisma.userRole.findUnique({
                                    where: {
                                        userId_roleId: { userId: userId, roleId: roleId },
                                    },
                                })];
                        case 3:
                            existing = _a.sent();
                            if (existing) {
                                throw new common_1.ConflictException('User already has this role');
                            }
                            return [2 /*return*/, this.prisma.userRole.create({
                                    data: { userId: userId, roleId: roleId },
                                    include: {
                                        role: {
                                            include: {
                                                permissions: {
                                                    include: { permission: true },
                                                },
                                            },
                                        },
                                    },
                                })];
                    }
                });
            });
        };
        RbacService_1.prototype.removeRoleFromUser = function (userId, roleId) {
            return __awaiter(this, void 0, void 0, function () {
                var userRole;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.userRole.findUnique({
                                where: {
                                    userId_roleId: { userId: userId, roleId: roleId },
                                },
                            })];
                        case 1:
                            userRole = _a.sent();
                            if (!userRole) {
                                throw new common_1.NotFoundException('User does not have this role');
                            }
                            return [4 /*yield*/, this.prisma.userRole.delete({
                                    where: {
                                        userId_roleId: { userId: userId, roleId: roleId },
                                    },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        RbacService_1.prototype.getUserPermissions = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var userRoles, permissions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.userRole.findMany({
                                where: { userId: userId },
                                include: {
                                    role: {
                                        include: {
                                            permissions: {
                                                include: { permission: true },
                                            },
                                        },
                                    },
                                },
                            })];
                        case 1:
                            userRoles = _a.sent();
                            permissions = userRoles.flatMap(function (ur) {
                                return ur.role.permissions.map(function (rp) { return rp.permission.key; });
                            });
                            return [2 /*return*/, __spreadArray([], new Set(permissions), true)];
                    }
                });
            });
        };
        RbacService_1.prototype.hasPermission = function (userId, permission) {
            return __awaiter(this, void 0, void 0, function () {
                var permissions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserPermissions(userId)];
                        case 1:
                            permissions = _a.sent();
                            return [2 /*return*/, permissions.includes(permission)];
                    }
                });
            });
        };
        RbacService_1.prototype.hasAnyPermission = function (userId, permissions) {
            return __awaiter(this, void 0, void 0, function () {
                var userPermissions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserPermissions(userId)];
                        case 1:
                            userPermissions = _a.sent();
                            return [2 /*return*/, permissions.some(function (p) { return userPermissions.includes(p); })];
                    }
                });
            });
        };
        RbacService_1.prototype.hasAllPermissions = function (userId, permissions) {
            return __awaiter(this, void 0, void 0, function () {
                var userPermissions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserPermissions(userId)];
                        case 1:
                            userPermissions = _a.sent();
                            return [2 /*return*/, permissions.every(function (p) { return userPermissions.includes(p); })];
                    }
                });
            });
        };
        return RbacService_1;
    }());
    __setFunctionName(_classThis, "RbacService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RbacService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RbacService = _classThis;
}();
exports.RbacService = RbacService;
