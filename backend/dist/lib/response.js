"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = void 0;
const createSuccessResponse = (status, message, data) => {
    return {
        success: true,
        status,
        message,
        data,
    };
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (status, message, error) => {
    return {
        success: false,
        status,
        message,
        error,
    };
};
exports.createErrorResponse = createErrorResponse;
