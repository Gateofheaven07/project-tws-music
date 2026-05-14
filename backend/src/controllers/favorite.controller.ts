import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

/**
 * Ngambil semua lagu favorit user.
 */
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        song: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Kita mapping biar formatnya seragam sama hasil search
    const results = favorites.map((f) => f.song);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar lagu favorit kamu.', results)
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil daftar favorit.')
    );
  }
};

/**
 * Tambah lagu ke favorit.
 */
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { songId, title, artist, album, thumbnail, duration } = req.body;

    if (!songId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'ID Lagunya mana?')
      );
    }

    // Pastiin lagunya ada di cache/table Song dulu
    await prisma.song.upsert({
      where: { id: songId },
      update: {},
      create: {
        id: songId,
        title: title || 'Unknown',
        artist: artist || 'Unknown',
        album: album || '',
        thumbnail: thumbnail || '',
        duration: duration || 0,
      },
    });

    // Tambah ke favorit
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_songId: { userId, songId },
      },
      update: {},
      create: {
        userId,
        songId,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Lagu berhasil ditambah ke favorit.', favorite)
    );
  } catch (error) {
    console.error('Add Favorite Error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal nambahin ke favorit.')
    );
  }
};

/**
 * Hapus lagu dari favorit.
 */
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { songId } = req.params;

    await prisma.favorite.delete({
      where: {
        userId_songId: { userId, songId },
      },
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Lagu dihapus dari favorit.')
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngehapus dari favorit.')
    );
  }
};
