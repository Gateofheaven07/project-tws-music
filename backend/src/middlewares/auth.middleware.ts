import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/auth/jwt';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import { createErrorResponse } from '../utils/response';

/**
 * Middleware buat jagain route biar cuma bisa diakses sama user yang udah login.
 * Caranya dengan ngecek token JWT yang dikirim lewat header Authorization.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ambil token dari header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Duh, kamu belum login nih atau tokennya ketinggalan.')
      );
    }

    // Verifikasi tokennya asli apa nggak
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Token kamu udah kadaluarsa atau nggak valid, coba login lagi ya.')
      );
    }

    // Kalau aman, masukin data user ke object request biar bisa dipake di controller
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    console.error('Middleware Auth Error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.SERVER_ERROR,
        'Ada masalah sedikit di server pas ngecek identitas kamu.'
      )
    );
  }
};
