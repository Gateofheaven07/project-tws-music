import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { avatarUploadDir, ensureUploadDirs } from '../lib/upload-paths';

// Konfigurasi cara file disimpan ke disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureUploadDirs();
      cb(null, avatarUploadDir);
    } catch (error) {
      cb(error as Error, avatarUploadDir);
    }
  },
  filename: (req, file, cb) => {
    // Format nama file: userId-timestamp.ext, biar unik dan nggak bentrok
    const userId = (req as any).user?.userId || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Filter tipe file, cuma izinin gambar saja
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Batas ukuran file maksimal 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadAvatarMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single('avatar');
