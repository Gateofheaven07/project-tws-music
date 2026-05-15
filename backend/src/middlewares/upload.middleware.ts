import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Tentukan folder tujuan penyimpanan avatar
const AVATAR_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatar');

// Buat foldernya kalau belum ada saat server pertama kali jalan
if (!fs.existsSync(AVATAR_UPLOAD_DIR)) {
  fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
}

// Konfigurasi cara file disimpan ke disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_UPLOAD_DIR);
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
