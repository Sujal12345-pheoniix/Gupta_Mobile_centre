"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignRoleDto = exports.UpdateRoleDto = exports.CreateRoleDto = void 0;
var zod_1 = require("zod");
exports.CreateRoleDto = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(50),
    description: zod_1.z.string().max(200).optional(),
    permissionIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
});
exports.UpdateRoleDto = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50).optional(),
    description: zod_1.z.string().max(200).optional(),
    permissionIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
});
exports.AssignRoleDto = zod_1.z.object({
    userId: zod_1.z.string().cuid(),
    roleId: zod_1.z.string().cuid(),
});
