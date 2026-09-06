"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordDto = void 0;
var zod_1 = require("zod");
exports.ForgotPasswordDto = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
