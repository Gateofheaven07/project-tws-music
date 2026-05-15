import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

/**
 * Ngambil semua lagu yang disukai user.
 */
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const likedSongs = await prisma.likedSong.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Kita mapping biar formatnya seragam sama hasil search
    const results = likedSongs.map((f) => ({
      musicId: f.musicId,
      title: f.title,
      artist: {
        id: `artist_unknown`,
        name: f.artist
      },
      album: {
        id: `album_unknown`,
        name: "",
        cover: {
          small: f.cover,
          medium: f.cover,
          big: f.cover,
          xl: f.cover
        }
      },
      duration: f.duration,
      genres: [],
      releaseDate: "",
      playback: {
        provider: "youtube",
        type: "iframe",
        videoId: f.videoId,
        embedUrl: f.videoId ? `https://www.youtube.com/embed/${f.videoId}` : null,
        youtubeUrl: f.videoId ? `https://www.youtube.com/watch?v=${f.videoId}` : null
      },
      statistics: {
        popularity: 0
      }
    }));

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar lagu favorit kamu.', results, {
        total: results.length,
        provider: {
          metadata: "database",
          playback: "youtube"
        }
      })
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
    const { musicId, title, artist, cover, duration, videoId } = req.body;

    if (!musicId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'ID Lagunya mana?')
      );
    }

    // Tambah ke likedSongs
    const likedSong = await prisma.likedSong.upsert({
      where: {
        userId_musicId: { userId, musicId },
      },
      update: {},
      create: {
        userId,
        musicId,
        title: title || 'Unknown',
        artist: artist || 'Unknown',
        cover: cover || '',
        duration: duration || 0,
        videoId: videoId || null,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Lagu berhasil ditambah ke favorit.', likedSong)
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
    const musicId = (req.params.musicId || req.params.songId) as string;

    await prisma.likedSong.delete({
      where: {
        userId_musicId: { userId, musicId },
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
