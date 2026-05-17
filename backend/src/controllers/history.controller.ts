import { Request, Response } from 'express';
import type { PlayHistory, Song } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

type PlayHistoryWithSong = PlayHistory & { song: Song };

/**
 * Ngambil riwayat lagu yang baru diputer.
 */
export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const history: PlayHistoryWithSong[] = await prisma.playHistory.findMany({
      where: { userId },
      include: {
        song: true,
      },
      orderBy: {
        playedAt: 'desc',
      },
      take: 50, // Ambil 50 lagu terakhir aja
    });

    const results = history.map((h: PlayHistoryWithSong) => ({
      musicId: h.song.id.startsWith('music_') ? h.song.id : `music_dz_${h.song.id}`,
      title: h.song.title,
      artist: {
        id: `artist_unknown`,
        name: h.song.artist
      },
      album: {
        id: `album_unknown`,
        name: h.song.album,
        cover: {
          small: h.song.thumbnail,
          medium: h.song.thumbnail,
          big: h.song.thumbnail,
          xl: h.song.thumbnail
        }
      },
      duration: h.song.duration,
      genres: [],
      releaseDate: "",
      playback: {
        provider: "youtube",
        type: "iframe",
        videoId: h.song.youtubeUrl,
        embedUrl: h.song.youtubeUrl ? `https://www.youtube.com/embed/${h.song.youtubeUrl}` : null,
        youtubeUrl: h.song.youtubeUrl ? `https://www.youtube.com/watch?v=${h.song.youtubeUrl}` : null
      },
      statistics: {
        popularity: 0
      }
    }));

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Riwayat putar kamu.', results, {
        total: results.length,
        provider: {
          metadata: "database",
          playback: "youtube"
        }
      })
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil riwayat.')
    );
  }
};

/**
 * Nyatet lagu yang baru aja diputer.
 */
export const addToHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { songId, title, artist, album, thumbnail, duration } = req.body;

    if (!songId) return res.sendStatus(HTTP_STATUS.BAD_REQUEST);

    // Pastiin lagunya ada
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

    // Catat ke history
    await prisma.playHistory.create({
      data: {
        userId,
        songId,
      }
    });

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Riwayat dicatat.')
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal nyatet riwayat.')
    );
  }
};
