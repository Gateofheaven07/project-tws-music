import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { createAccessToken, createRefreshToken } from '../lib/auth/jwt';
import { normalizeAvatar } from '../lib/avatar';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

/**
 * Controller buat nanganin pendaftaran user baru.
 * Kita bakal ngecek dulu apa email/username udah kepake atau belum.
 */

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validasi input sederhana, nanti bisa ditambah Zod kalau mau lebih ketat
    if (!email || !username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Email, username, sama password wajib diisi ya.')
      );
    }

    // Cek dulu apa user udah terdaftar
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        createErrorResponse(HTTP_STATUS.CONFLICT, 'Wah, email atau username ini udah ada yang punya.')
      );
    }

    // Amankan password sebelum disimpen
    const hashedPassword = await hashPassword(password);

    // Bikin user baru di database
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Kita hapus bagian pembuatan token otomatis di sini. 
    // Jadi user harus login manual setelah akunnya berhasil dibuat.

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Yeay! Akun kamu berhasil dibuat. Silakan login ya.', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: normalizeAvatar(user.avatar),
        }
      })
    );
  } catch (error) {
    console.error('Register error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Aduh, server lagi pusing nih pas mau daftarin kamu.',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Email sama password jangan sampe kosong ya.')
      );
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Email atau password kamu salah, coba cek lagi deh.')
      );
    }

    // Cek passwordnya cocok apa nggak
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Email atau password kamu salah, coba cek lagi deh.')
      );
    }

    // Kalo cocok, kasih token buat akses API
    const accessToken = createAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = createRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Selamat datang kembali! Kamu berhasil login.', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: normalizeAvatar(user.avatar),
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Waduh, ada kendala pas mau login-in kamu.',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
};

/**
 * Ambil data user yang lagi login.
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Identitas kamu nggak ketemu nih.')
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User-nya nggak ada di database kita.')
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Ini data profil kamu ya.', {
        user: {
          ...user,
          avatar: normalizeAvatar(user.avatar),
        },
      })
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data profil kamu.')
    );
  }
};

/**
 * Buat logout. Karena pake JWT, biasanya frontend tinggal hapus token di storage aja.
 * Tapi kita kasih response success aja buat formalitas.
 */
export const logout = async (req: Request, res: Response) => {
  return res.status(HTTP_STATUS.OK).json(
    createSuccessResponse(HTTP_STATUS.OK, 'Sampai jumpa lagi! Kamu berhasil logout.')
  );
};
