"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
var zod_1 = require("zod");
exports.CreateUserDto = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(10).max(15).optional(),
    password: zod_1.z.string().min(6).optional(),
    name: zod_1.z.string().min(1),
    roleIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
});
exports.UpdateUserDto = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(10).max(15).optional(),
    name: zod_1.z.string().min(1).optional(),
});
exports.ChangePasswordDto = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6),
});
