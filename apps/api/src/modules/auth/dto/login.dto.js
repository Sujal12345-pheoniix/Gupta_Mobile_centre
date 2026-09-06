"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDto = void 0;
var zod_1 = require("zod");
exports.LoginDto = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').optional(),
    phone: zod_1.z.string().min(10).max(15).optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
}).refine(function (data) { return data.email || data.phone; }, {
    message: 'Either email or phone is required',
});
