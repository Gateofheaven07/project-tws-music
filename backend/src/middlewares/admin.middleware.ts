import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../utils/constants';
import { createErrorResponse } from '../utils/response';

/**
 * Middleware buat mastiin cuma ADMIN atau SUPER_ADMIN yang bisa akses route tertentu.
 * Harus dipake setelah authMiddleware (karena butuh req.user).
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || !user.role) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Kamu nggak punya akses ke halaman ini.')
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Kamu nggak punya akses ke halaman ini.')
    );
  }

  next();
};

/**
 * Middleware khusus buat SUPER_ADMIN aja (misal: manage users, ubah role).
 * Harus dipake setelah authMiddleware.
 */
export const superAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.role !== 'SUPER_ADMIN') {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Hanya Super Admin yang bisa melakukan ini.')
    );
  }

  next();
};
