"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../lib/auth/jwt");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
/**
 * Middleware buat jagain route biar cuma bisa diakses sama user yang udah login.
 * Caranya dengan ngecek token JWT yang dikirim lewat header Authorization.
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Ambil token dari header Authorization: Bearer <token>
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Duh, kamu belum login nih atau tokennya ketinggalan.'));
        }
        // Verifikasi tokennya asli apa nggak
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Token kamu udah kadaluarsa atau nggak valid, coba login lagi ya.'));
        }
        // Kalau aman, masukin data user ke object request biar bisa dipake di controller
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Middleware Auth Error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, constants_1.ERROR_MESSAGES.SERVER_ERROR, 'Ada masalah sedikit di server pas ngecek identitas kamu.'));
    }
};
exports.authMiddleware = authMiddleware;
