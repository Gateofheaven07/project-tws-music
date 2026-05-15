import { Router, Request, Response, NextFunction } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadAvatarMiddleware } from '../middlewares/upload.middleware';
import { HTTP_STATUS } from '../utils/constants';
import { createErrorResponse } from '../utils/response';

const router = Router();

// Semua route di bawah ini wajib pake JWT — user harus sudah login
router.use(authMiddleware);

// Ambil data profil user yang sedang login
router.get('/me', profileController.getProfile);

// Update username
router.patch('/username', profileController.updateUsername);

// Update password (dengan verifikasi password lama)
router.patch('/password', profileController.updatePassword);

// Upload dan update foto profil (avatar)
// Kita wrap uploadAvatarMiddleware biar error multer bisa ditangani dengan response JSON yang rapi
router.patch('/avatar', (req: Request, res: Response, next: NextFunction) => {
  uploadAvatarMiddleware(req, res, (err) => {
    if (err) {
      // Error dari multer (misal: tipe file salah, ukuran terlalu besar)
      let message = 'Gagal upload avatar.';
      if (err.message === 'Only image files are allowed') {
        message = 'Only image files are allowed';
      } else if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'Ukuran file terlalu besar, maksimal 5MB.';
      }
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, message)
      );
    }
    next();
  });
}, profileController.updateAvatar);

// Ambil riwayat lagu yang pernah diputar
router.get('/history', profileController.getProfileHistory);

export default router;
