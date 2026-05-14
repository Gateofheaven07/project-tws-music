import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

/**
 * Ngambil semua playlist milik user.
 */
export const getMyPlaylists = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar playlist kamu.', playlists)
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil playlist.')
    );
  }
};

/**
 * Bikin playlist baru.
 */
export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Nama playlist-nya jangan lupa diisi.')
      );
    }

    const playlist = await prisma.playlist.create({
      data: {
        userId,
        name,
        description,
        isPublic: isPublic || false,
      }
    });

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Playlist berhasil dibuat.', playlist)
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal bikin playlist.')
    );
  }
};

/**
 * Nambahin lagu ke playlist.
 */
export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const playlistId = req.params.playlistId as string;
    const { songId, title, artist, album, thumbnail, duration } = req.body;

    // Pastiin lagunya ada di cache
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

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      }
    });

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Lagu berhasil ditambah ke playlist.', playlistSong)
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal nambahin lagu ke playlist.')
    );
  }
};

/**
 * Ambil detail playlist beserta lagu-lagunya.
 */
export const getPlaylistDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            song: true
          }
        }
      }
    });

    if (!playlist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu.')
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Detail playlist.', playlist)
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil detail playlist.')
    );
  }
};

/**
 * Hapus playlist.
 */
export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId;

    // Pastiin playlist-nya punya user yang login
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId }
    });

    if (!playlist) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu atau kamu nggak punya akses.')
      );
    }

    await prisma.playlist.delete({
      where: { id }
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Playlist berhasil dihapus.')
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngehapus playlist.')
    );
  }
};
