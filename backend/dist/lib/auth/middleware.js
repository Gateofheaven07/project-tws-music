"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = exports.verifyAuth = void 0;
const server_1 = require("next/server");
const jwt_1 = require("./jwt");
const response_1 = require("@/lib/api/response");
const constants_1 = require("@/lib/api/constants");
const verifyAuth = (request) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        console.error('[v0] No authorization header');
        return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.error('[v0] Invalid authorization header format');
        return null;
    }
    const token = parts[1];
    const payload = (0, jwt_1.verifyAccessToken)(token);
    if (!payload) {
        console.error('[v0] Invalid or expired token');
        return null;
    }
    return payload;
};
exports.verifyAuth = verifyAuth;
const withAuth = (handler) => {
    return async (request) => {
        const user = (0, exports.verifyAuth)(request);
        if (!user) {
            return server_1.NextResponse.json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, constants_1.ERROR_MESSAGES.INVALID_TOKEN), { status: constants_1.HTTP_STATUS.UNAUTHORIZED });
        }
        const authRequest = request;
        authRequest.user = user;
        return handler(authRequest);
    };
};
exports.withAuth = withAuth;
