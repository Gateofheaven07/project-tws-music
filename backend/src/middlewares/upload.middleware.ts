import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

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
