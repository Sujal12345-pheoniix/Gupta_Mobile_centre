"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var bcrypt = require("bcrypt");
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(prisma, jwtService, config) {
            this.prisma = prisma;
            this.jwtService = jwtService;
            this.config = config;
            this.accessTokenExpiry = 15 * 60; // 15 minutes in seconds
            this.refreshTokenExpiry = 30 * 24 * 60 * 60; // 30 days in seconds
        }
        AuthService_1.prototype.login = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var email, phone, password, user, isPasswordValid, roleIds, permissions, authUser, tokens;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            email = input.email, phone = input.phone, password = input.password;
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: {
                                        OR: [
                                            email ? { email: email } : undefined,
                                            phone ? { phone: phone } : undefined,
                                        ].filter(Boolean),
                                    },
                                    include: {
                                        organization: true,
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
                            user = _b.sent();
                            if (!user) {
                                throw new common_1.UnauthorizedException('Invalid credentials');
                            }
                            if (user.status !== 'ACTIVE') {
                                throw new common_1.UnauthorizedException('Account is not active');
                            }
                            return [4 /*yield*/, bcrypt.compare(password, user.passwordHash)];
                        case 2:
                            isPasswordValid = _b.sent();
                            if (!isPasswordValid) {
                                throw new common_1.UnauthorizedException('Invalid credentials');
                            }
                            // Update last login
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: user.id },
                                    data: { lastLoginAt: new Date() },
                                })];
                        case 3:
                            // Update last login
                            _b.sent();
                            roleIds = user.roles.map(function (ur) { return ur.roleId; });
                            permissions = user.roles.flatMap(function (ur) {
                                return ur.role.permissions.map(function (rp) { return rp.permission.key; });
                            });
                            authUser = {
                                id: user.id,
                                email: user.email,
                                phone: user.phone,
                                name: ((_a = user.employee) === null || _a === void 0 ? void 0 : _a.name) || user.email || user.phone || 'User',
                                organizationId: user.organizationId,
                                organizationName: user.organization.name,
                                roles: [],
                                permissions: __spreadArray([], new Set(permissions), true),
                            };
                            return [4 /*yield*/, this.generateTokens(authUser, roleIds)];
                        case 4:
                            tokens = _b.sent();
                            return [2 /*return*/, { user: authUser, tokens: tokens }];
                    }
                });
            });
        };
        AuthService_1.prototype.register = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var email, phone, password, name, organizationId, organizationName, existingUser, passwordHash, orgId, org, branch, user, staffRole, authUser, tokens;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            email = input.email, phone = input.phone, password = input.password, name = input.name, organizationId = input.organizationId, organizationName = input.organizationName;
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: {
                                        OR: [
                                            email ? { email: email } : undefined,
                                            phone ? { phone: phone } : undefined,
                                        ].filter(Boolean),
                                    },
                                })];
                        case 1:
                            existingUser = _b.sent();
                            if (existingUser) {
                                throw new common_1.ConflictException('User with this email or phone already exists');
                            }
                            return [4 /*yield*/, bcrypt.hash(password, 10)];
                        case 2:
                            passwordHash = _b.sent();
                            orgId = organizationId;
                            if (!(!orgId && organizationName)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.organization.create({
                                    data: {
                                        name: organizationName,
                                        timezone: 'Asia/Kolkata',
                                        currency: 'INR',
                                    },
                                })];
                        case 3:
                            org = _b.sent();
                            orgId = org.id;
                            _b.label = 4;
                        case 4:
                            if (!orgId) {
                                throw new common_1.ConflictException('Organization ID or name is required');
                            }
                            return [4 /*yield*/, this.prisma.branch.findFirst({
                                    where: { organizationId: orgId },
                                })];
                        case 5:
                            branch = _b.sent();
                            if (!!branch) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.branch.create({
                                    data: {
                                        organizationId: orgId,
                                        name: 'Head Office',
                                        code: 'HO',
                                        isActive: true,
                                    },
                                })];
                        case 6:
                            branch = _b.sent();
                            _b.label = 7;
                        case 7: return [4 /*yield*/, this.prisma.user.create({
                                data: {
                                    organizationId: orgId,
                                    email: email || null,
                                    phone: phone || null,
                                    passwordHash: passwordHash,
                                    status: 'ACTIVE',
                                    employee: {
                                        create: {
                                            organizationId: orgId,
                                            branchId: branch.id,
                                            employeeCode: "EMP".concat(Date.now()),
                                            name: name,
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
                            })];
                        case 8:
                            user = _b.sent();
                            return [4 /*yield*/, this.prisma.role.findUnique({
                                    where: { name: 'Staff' },
                                })];
                        case 9:
                            staffRole = _b.sent();
                            if (!staffRole) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.prisma.userRole.create({
                                    data: {
                                        userId: user.id,
                                        roleId: staffRole.id,
                                    },
                                })];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11:
                            authUser = {
                                id: user.id,
                                email: user.email,
                                phone: user.phone,
                                name: ((_a = user.employee) === null || _a === void 0 ? void 0 : _a.name) || name,
                                organizationId: user.organizationId,
                                organizationName: user.organization.name,
                                roles: staffRole ? [staffRole.name] : [],
                                permissions: [],
                            };
                            return [4 /*yield*/, this.generateTokens(authUser, staffRole ? [staffRole.id] : [])];
                        case 12:
                            tokens = _b.sent();
                            return [2 /*return*/, { user: authUser, tokens: tokens }];
                    }
                });
            });
        };
        AuthService_1.prototype.refreshTokens = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var refreshToken, payload, user, roleIds, permissions, authUser, _a;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            refreshToken = input.refreshToken;
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            payload = this.jwtService.verify(refreshToken, {
                                secret: this.config.get('JWT_REFRESH_SECRET'),
                            });
                            if (payload.type !== 'refresh') {
                                throw new common_1.UnauthorizedException('Invalid token type');
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: payload.sub },
                                    include: {
                                        organization: true,
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
                        case 2:
                            user = _c.sent();
                            if (!user || user.status !== 'ACTIVE') {
                                throw new common_1.UnauthorizedException('User not found or inactive');
                            }
                            roleIds = user.roles.map(function (ur) { return ur.roleId; });
                            permissions = user.roles.flatMap(function (ur) {
                                return ur.role.permissions.map(function (rp) { return rp.permission.key; });
                            });
                            authUser = {
                                id: user.id,
                                email: user.email,
                                phone: user.phone,
                                name: ((_b = user.employee) === null || _b === void 0 ? void 0 : _b.name) || user.email || 'User',
                                organizationId: user.organizationId,
                                organizationName: user.organization.name,
                                roles: [],
                                permissions: __spreadArray([], new Set(permissions), true),
                            };
                            return [2 /*return*/, this.generateTokens(authUser, roleIds)];
                        case 3:
                            _a = _c.sent();
                            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.logout = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/];
                });
            });
        };
        AuthService_1.prototype.validateUser = function (payload) {
            return __awaiter(this, void 0, void 0, function () {
                var user, permissions;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (payload.type !== 'access') {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({
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
                                })];
                        case 1:
                            user = _b.sent();
                            if (!user || user.status !== 'ACTIVE') {
                                return [2 /*return*/, null];
                            }
                            permissions = user.roles.flatMap(function (ur) {
                                return ur.role.permissions.map(function (rp) { return rp.permission.key; });
                            });
                            return [2 /*return*/, {
                                    id: user.id,
                                    email: user.email,
                                    phone: user.phone,
                                    name: ((_a = user.employee) === null || _a === void 0 ? void 0 : _a.name) || user.email || 'User',
                                    organizationId: user.organizationId,
                                    organizationName: user.organization.name,
                                    roles: user.roles.map(function (ur) { return ur.role.name; }),
                                    permissions: __spreadArray([], new Set(permissions), true),
                                }];
                    }
                });
            });
        };
        AuthService_1.prototype.getMe = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, permissions;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
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
                            })];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                throw new common_1.UnauthorizedException('User not found');
                            }
                            permissions = user.roles.flatMap(function (ur) {
                                return ur.role.permissions.map(function (rp) { return rp.permission.key; });
                            });
                            return [2 /*return*/, {
                                    id: user.id,
                                    email: user.email,
                                    phone: user.phone,
                                    name: ((_a = user.employee) === null || _a === void 0 ? void 0 : _a.name) || user.email || 'User',
                                    organizationId: user.organizationId,
                                    organizationName: user.organization.name,
                                    roles: user.roles.map(function (ur) { return ur.role.name; }),
                                    permissions: __spreadArray([], new Set(permissions), true),
                                }];
                    }
                });
            });
        };
        AuthService_1.prototype.generateTokens = function (user, roleIds) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, accessToken, refreshPayload, refreshToken;
                return __generator(this, function (_a) {
                    payload = {
                        sub: user.id,
                        email: user.email || undefined,
                        phone: user.phone || undefined,
                        organizationId: user.organizationId,
                        roleIds: roleIds,
                        type: 'access',
                    };
                    accessToken = this.jwtService.sign(payload, {
                        expiresIn: this.accessTokenExpiry,
                    });
                    refreshPayload = __assign(__assign({}, payload), { type: 'refresh' });
                    refreshToken = this.jwtService.sign(refreshPayload, {
                        secret: this.config.get('JWT_REFRESH_SECRET'),
                        expiresIn: this.refreshTokenExpiry,
                    });
                    return [2 /*return*/, {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            expiresIn: this.accessTokenExpiry,
                        }];
                });
            });
        };
        AuthService_1.prototype.hashPassword = function (password) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, bcrypt.hash(password, 10)];
                });
            });
        };
        AuthService_1.prototype.verifyPassword = function (password, hash) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, bcrypt.compare(password, hash)];
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
