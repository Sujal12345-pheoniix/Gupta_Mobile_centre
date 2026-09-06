"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
var zod_1 = require("zod");
exports.RegisterDto = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').optional(),
    phone: zod_1.z.string().min(10).max(15).optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(1, 'Name is required'),
    organizationId: zod_1.z.string().cuid().optional(),
    organizationName: zod_1.z.string().min(1).optional(),
});
