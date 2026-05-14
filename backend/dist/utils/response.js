"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = void 0;
const createSuccessResponse = (status, message, data, meta) => {
    const response = {
        success: true,
        status,
        message,
        timestamp: new Date().toISOString(),
    };
    if (meta) {
        response.meta = meta;
    }
    if (Array.isArray(data)) {
        response.results = data;
    }
    else {
        response.data = data;
    }
    return response;
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (status, message, error) => {
    return {
        success: false,
        status,
        message,
        timestamp: new Date().toISOString(),
        error,
    };
};
exports.createErrorResponse = createErrorResponse;
