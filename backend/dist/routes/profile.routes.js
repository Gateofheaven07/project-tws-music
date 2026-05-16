"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController = __importStar(require("../controllers/profile.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// Semua route di bawah ini wajib pake JWT — user harus sudah login
router.use(auth_middleware_1.authMiddleware);
// Ambil data profil user yang sedang login
router.get('/me', profileController.getProfile);
// Update username
router.patch('/username', profileController.updateUsername);
// Update password (dengan verifikasi password lama)
router.patch('/password', profileController.updatePassword);
// Upload dan update foto profil (avatar)
// Kita wrap uploadAvatarMiddleware biar error multer bisa ditangani dengan response JSON yang rapi
router.patch('/avatar', (req, res, next) => {
    (0, upload_middleware_1.uploadAvatarMiddleware)(req, res, (err) => {
        if (err) {
            // Error dari multer (misal: tipe file salah, ukuran terlalu besar)
            let message = 'Gagal upload avatar.';
            if (err.message === 'Only image files are allowed') {
                message = 'Only image files are allowed';
            }
            else if (err.code === 'LIMIT_FILE_SIZE') {
                message = 'Ukuran file terlalu besar, maksimal 5MB.';
            }
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, message));
        }
        next();
    });
}, profileController.updateAvatar);
// Ambil riwayat lagu yang pernah diputar
router.get('/history', profileController.getProfileHistory);
exports.default = router;
