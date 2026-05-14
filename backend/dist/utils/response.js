"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = void 0;
const createSuccessResponse = (status, message, data) => {
    const response = {
        success: true,
        status,
        message,
    };
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
        error,
    };
};
exports.createErrorResponse = createErrorResponse;
