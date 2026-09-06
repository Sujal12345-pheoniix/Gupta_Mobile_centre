"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = void 0;
var zod_1 = require("zod");
exports.ResetPasswordDto = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
