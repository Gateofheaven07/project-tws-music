import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { createAvatarDataUrl, normalizeAvatar } from '../lib/avatar';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

type SongRow = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string | null;
  duration: number;
  youtubeUrl: string | null;
};

type PlayHistoryWithSongRow = {
  id: string;
  playedAt: Date;
  song: SongRow;
};

/**
 * Ambil data profil user yang sedang login.
 * Hanya kembalikan field yang aman, password hash jangan sampai bocor ke frontend.
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.')
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'User profile fetched successfully', {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: normalizeAvatar(user.avatar),
        createdAt: user.createdAt,
      })
    );
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal mengambil data profil.')
    );
  }
};

/**
 * Update username user.
 * Cek dulu apakah username baru sudah dipakai user lain.
 */
export const updateUsername = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Username minimal 3 karakter.')
      );
    }

    const trimmedUsername = username.trim();

    // Pastikan username belum dipakai user lain
    const existing = await prisma.user.findFirst({
      where: {
        username: trimmedUsername,
        NOT: { id: userId },
      },
    });

    if (existing) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        createErrorResponse(HTTP_STATUS.CONFLICT, 'Username sudah dipakai orang lain, coba yang lain ya.')
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username: trimmedUsername },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Username updated successfully', {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: normalizeAvatar(updatedUser.avatar),
      })
    );
  } catch (error) {
    console.error('updateUsername error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal update username.')
    );
  }
};

/**
 * Update password user.
 * User harus masukkan password lama yang benar dulu sebelum bisa ganti password baru.
 */
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Password lama dan password baru wajib diisi.')
      );
    }

    if (newPassword.length < 6) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Password baru minimal 6 karakter.')
      );
    }

    // Ambil password hash yang tersimpan di database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.')
      );
    }

    if (!user.password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(
          HTTP_STATUS.BAD_REQUEST,
          'Akun Google belum punya password lokal. Silakan atur password dari menu yang sesuai.'
        )
      );
    }

    // Verifikasi password lama
    const isPasswordValid = await verifyPassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Current password is incorrect')
      );
    }

    // Hash password baru lalu simpan
    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Password updated successfully')
    );
  } catch (error) {
    console.error('updatePassword error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal update password.')
    );
  }
};

/**
 * Update foto profil (avatar) user.
 * File sudah diproses oleh multer middleware sebelum masuk ke sini.
 * Hapus avatar lama dari disk kalau ada, lalu simpan URL avatar baru ke database.
 */
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    // Multer udah handle upload-nya, file ada di req.file
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Tidak ada file yang diupload.')
      );
    }

    const avatarDataUrl = createAvatarDataUrl(req.file);

    // Simpan URL avatar baru ke database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarDataUrl },
      select: { id: true, avatar: true },
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Profile avatar updated successfully', {
        id: updatedUser.id,
        avatar: normalizeAvatar(updatedUser.avatar),
      })
    );
  } catch (error) {
    console.error('updateAvatar error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal update avatar.')
    );
  }
};

/**
 * Ambil riwayat lagu yang pernah diputar user untuk ditampilkan di halaman profil.
 * Format responsenya disesuaikan biar frontend bisa langsung memutar ulang lagunya.
 */
export const getProfileHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const history: PlayHistoryWithSongRow[] = await prisma.playHistory.findMany({
      where: { userId },
      include: {
        song: true,
      },
      orderBy: {
        playedAt: 'desc',
      },
      take: 50,
    });

    const results = history.map((h: PlayHistoryWithSongRow) => ({
      id: h.id,
      musicId: h.song.id.startsWith('music_') ? h.song.id : `music_dz_${h.song.id}`,
      title: h.song.title,
      artist: h.song.artist,
      cover: h.song.thumbnail || '',
      duration: h.song.duration,
      videoId: h.song.youtubeUrl || null,
      playedAt: h.playedAt,
    }));

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Play history fetched successfully', results, {
        total: results.length,
      })
    );
  } catch (error) {
    console.error('getProfileHistory error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal mengambil riwayat putar.')
    );
  }
};
