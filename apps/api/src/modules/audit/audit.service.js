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
exports.AuditService = void 0;
var common_1 = require("@nestjs/common");
var AuditService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuditService = _classThis = /** @class */ (function () {
        function AuditService_1(prisma) {
            this.prisma = prisma;
        }
        AuditService_1.prototype.log = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var organizationId, actorId, action, entityType, entityId, beforeData, afterData, metadata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            organizationId = input.organizationId, actorId = input.actorId, action = input.action, entityType = input.entityType, entityId = input.entityId, beforeData = input.beforeData, afterData = input.afterData, metadata = input.metadata;
                            return [4 /*yield*/, this.prisma.auditLog.create({
                                    data: {
                                        organizationId: organizationId,
                                        actorId: actorId || null,
                                        action: action,
                                        entityType: entityType,
                                        entityId: entityId || null,
                                        beforeData: beforeData || null,
                                        afterData: afterData || null,
                                        metadata: metadata || null,
                                    },
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuditService_1.prototype.logBatch = function (inputs) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.auditLog.createMany({
                                data: inputs.map(function (input) { return ({
                                    organizationId: input.organizationId,
                                    actorId: input.actorId || null,
                                    action: input.action,
                                    entityType: input.entityType,
                                    entityId: input.entityId || null,
                                    beforeData: input.beforeData || null,
                                    afterData: input.afterData || null,
                                    metadata: input.metadata || null,
                                }); }),
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuditService_1.prototype.getAuditLogs = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var organizationId, entityType, entityId, actorId, action, startDate, endDate, _a, limit, _b, offset, where, _c, logs, total;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            organizationId = options.organizationId, entityType = options.entityType, entityId = options.entityId, actorId = options.actorId, action = options.action, startDate = options.startDate, endDate = options.endDate, _a = options.limit, limit = _a === void 0 ? 50 : _a, _b = options.offset, offset = _b === void 0 ? 0 : _b;
                            where = { organizationId: organizationId };
                            if (entityType)
                                where.entityType = entityType;
                            if (entityId)
                                where.entityId = entityId;
                            if (actorId)
                                where.actorId = actorId;
                            if (action)
                                where.action = action;
                            if (startDate || endDate) {
                                where.createdAt = {};
                                if (startDate)
                                    where.createdAt.gte = startDate;
                                if (endDate)
                                    where.createdAt.lte = endDate;
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.auditLog.findMany({
                                        where: where,
                                        include: {
                                            actor: {
                                                select: {
                                                    id: true,
                                                    email: true,
                                                    phone: true,
                                                },
                                            },
                                        },
                                        orderBy: { createdAt: 'desc' },
                                        take: limit,
                                        skip: offset,
                                    }),
                                    this.prisma.auditLog.count({ where: where }),
                                ])];
                        case 1:
                            _c = _d.sent(), logs = _c[0], total = _c[1];
                            return [2 /*return*/, {
                                    data: logs,
                                    pagination: {
                                        total: total,
                                        limit: limit,
                                        offset: offset,
                                        hasMore: offset + logs.length < total,
                                    },
                                }];
                    }
                });
            });
        };
        AuditService_1.prototype.getEntityHistory = function (organizationId, entityType, entityId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.auditLog.findMany({
                            where: {
                                organizationId: organizationId,
                                entityType: entityType,
                                entityId: entityId,
                            },
                            include: {
                                actor: {
                                    select: {
                                        id: true,
                                        email: true,
                                    },
                                },
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        AuditService_1.prototype.getActorActivity = function (organizationId_1, actorId_1) {
            return __awaiter(this, arguments, void 0, function (organizationId, actorId, limit) {
                if (limit === void 0) { limit = 50; }
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.auditLog.findMany({
                            where: {
                                organizationId: organizationId,
                                actorId: actorId,
                            },
                            orderBy: { createdAt: 'desc' },
                            take: limit,
                        })];
                });
            });
        };
        return AuditService_1;
    }());
    __setFunctionName(_classThis, "AuditService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditService = _classThis;
}();
exports.AuditService = AuditService;
