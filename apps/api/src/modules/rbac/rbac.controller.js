"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.RbacController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var permissions_guard_1 = require("../auth/guards/permissions.guard");
var RbacController = function () {
    var _classDecorators = [(0, common_1.Controller)('rbac'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getRoles_decorators;
    var _getRole_decorators;
    var _createRole_decorators;
    var _updateRole_decorators;
    var _getPermissions_decorators;
    var _getUserRoles_decorators;
    var _assignRoleToUser_decorators;
    var _removeRoleFromUser_decorators;
    var RbacController = _classThis = /** @class */ (function () {
        function RbacController_1(rbacService) {
            this.rbacService = (__runInitializers(this, _instanceExtraInitializers), rbacService);
        }
        // ============ Roles ============
        RbacController_1.prototype.getRoles = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.getRoles()];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        RbacController_1.prototype.getRole = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.getRole(id)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        RbacController_1.prototype.createRole = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.createRole('system', input)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        RbacController_1.prototype.updateRole = function (id, input) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.updateRole(id, input)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        // ============ Permissions ============
        RbacController_1.prototype.getPermissions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.getPermissions()];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        // ============ User Role Assignment ============
        RbacController_1.prototype.getUserRoles = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.getUserRoles(userId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        RbacController_1.prototype.assignRoleToUser = function (userId, input) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.assignRoleToUser(userId, input)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        RbacController_1.prototype.removeRoleFromUser = function (userId, roleId) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.rbacService.removeRoleFromUser(userId, roleId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { success: true, data: data }];
                    }
                });
            });
        };
        return RbacController_1;
    }());
    __setFunctionName(_classThis, "RbacController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getRoles_decorators = [(0, common_1.Get)('roles'), (0, permissions_guard_1.RequirePermissions)('roles.manage', 'roles.view')];
        _getRole_decorators = [(0, common_1.Get)('roles/:id'), (0, permissions_guard_1.RequirePermissions)('roles.manage', 'roles.view')];
        _createRole_decorators = [(0, common_1.Post)('roles'), (0, permissions_guard_1.RequirePermissions)('roles.manage')];
        _updateRole_decorators = [(0, common_1.Patch)('roles/:id'), (0, permissions_guard_1.RequirePermissions)('roles.manage')];
        _getPermissions_decorators = [(0, common_1.Get)('permissions'), (0, permissions_guard_1.RequirePermissions)('roles.manage', 'roles.view')];
        _getUserRoles_decorators = [(0, common_1.Get)('users/:userId/roles'), (0, permissions_guard_1.RequirePermissions)('roles.manage', 'users.view')];
        _assignRoleToUser_decorators = [(0, common_1.Post)('users/:userId/roles'), (0, permissions_guard_1.RequirePermissions)('roles.manage')];
        _removeRoleFromUser_decorators = [(0, common_1.Delete)('users/:userId/roles/:roleId'), (0, permissions_guard_1.RequirePermissions)('roles.manage')];
        __esDecorate(_classThis, null, _getRoles_decorators, { kind: "method", name: "getRoles", static: false, private: false, access: { has: function (obj) { return "getRoles" in obj; }, get: function (obj) { return obj.getRoles; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRole_decorators, { kind: "method", name: "getRole", static: false, private: false, access: { has: function (obj) { return "getRole" in obj; }, get: function (obj) { return obj.getRole; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRole_decorators, { kind: "method", name: "createRole", static: false, private: false, access: { has: function (obj) { return "createRole" in obj; }, get: function (obj) { return obj.createRole; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateRole_decorators, { kind: "method", name: "updateRole", static: false, private: false, access: { has: function (obj) { return "updateRole" in obj; }, get: function (obj) { return obj.updateRole; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPermissions_decorators, { kind: "method", name: "getPermissions", static: false, private: false, access: { has: function (obj) { return "getPermissions" in obj; }, get: function (obj) { return obj.getPermissions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserRoles_decorators, { kind: "method", name: "getUserRoles", static: false, private: false, access: { has: function (obj) { return "getUserRoles" in obj; }, get: function (obj) { return obj.getUserRoles; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _assignRoleToUser_decorators, { kind: "method", name: "assignRoleToUser", static: false, private: false, access: { has: function (obj) { return "assignRoleToUser" in obj; }, get: function (obj) { return obj.assignRoleToUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _removeRoleFromUser_decorators, { kind: "method", name: "removeRoleFromUser", static: false, private: false, access: { has: function (obj) { return "removeRoleFromUser" in obj; }, get: function (obj) { return obj.removeRoleFromUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RbacController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RbacController = _classThis;
}();
exports.RbacController = RbacController;
