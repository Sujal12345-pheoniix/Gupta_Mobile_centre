"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationPipe = void 0;
var ValidationPipe = /** @class */ (function () {
    function ValidationPipe() {
    }
    ValidationPipe.prototype.transform = function (value) {
        return value;
    };
    return ValidationPipe;
}());
exports.ValidationPipe = ValidationPipe;
