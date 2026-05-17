"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatarMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload_paths_1 = require("../lib/upload-paths");
// Konfigurasi cara file disimpan ke disk
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        try {
            (0, upload_paths_1.ensureUploadDirs)();
            cb(null, upload_paths_1.avatarUploadDir);
        }
        catch (error) {
            cb(error, upload_paths_1.avatarUploadDir);
        }
    },
    filename: (req, file, cb) => {
        // Format nama file: userId-timestamp.ext, biar unik dan nggak bentrok
        const userId = req.user?.userId || 'unknown';
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const filename = `${userId}-${Date.now()}${ext}`;
        cb(null, filename);
    },
});
// Filter tipe file, cuma izinin gambar saja
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
// Batas ukuran file maksimal 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
exports.uploadAvatarMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
}).single('avatar');
