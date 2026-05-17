"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAvatarPath = exports.ensureUploadDirs = exports.avatarUploadDir = exports.uploadsStaticDir = void 0;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadRoot = isServerless
    ? path_1.default.join(os_1.default.tmpdir(), 'soundwave-uploads')
    : path_1.default.join(process.cwd(), 'uploads');
exports.uploadsStaticDir = uploadRoot;
exports.avatarUploadDir = path_1.default.join(uploadRoot, 'avatar');
const ensureUploadDirs = () => {
    try {
        fs_1.default.mkdirSync(exports.avatarUploadDir, { recursive: true });
        logger_1.logger.info('Upload directory ready', {
            avatarUploadDir: exports.avatarUploadDir,
            isServerless,
            writableRoot: isServerless ? os_1.default.tmpdir() : process.cwd(),
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to prepare upload directory', {
            error,
            avatarUploadDir: exports.avatarUploadDir,
            cwd: process.cwd(),
            tmpdir: os_1.default.tmpdir(),
            isServerless,
        });
        throw error;
    }
};
exports.ensureUploadDirs = ensureUploadDirs;
const resolveAvatarPath = (filename) => path_1.default.join(exports.avatarUploadDir, filename);
exports.resolveAvatarPath = resolveAvatarPath;
