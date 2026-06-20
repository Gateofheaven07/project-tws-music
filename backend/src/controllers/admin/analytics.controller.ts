import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { HTTP_STATUS } from '../../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';

/**
 * Tren pendaftaran user per hari (30 hari terakhir).
 */
export const getRegistrationTrend = async (_req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "users"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Data tren pendaftaran berhasil diambil.', 
        data.map((r) => ({ ...r, count: Number(r.count) }))
      )
    );
  } catch (error) {
    console.error('getRegistrationTrend error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data tren pendaftaran.')
    );
  }
};

/**
 * Top 10 lagu paling sering diputar.
 */
export const getTopSongs = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.$queryRaw<{ title: string; artist: string; thumbnail: string | null; count: bigint }[]>`
      SELECT s."title", s."artist", s."thumbnail", COUNT(*)::bigint as count
      FROM "play_history" ph
      JOIN "songs" s ON ph."songId" = s."id"
      GROUP BY s."title", s."artist", s."thumbnail"
      ORDER BY count DESC
      LIMIT 10
    `;

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Top songs berhasil diambil.', 
        data.map((r) => ({ ...r, count: Number(r.count) }))
      )
    );
  } catch (error) {
    console.error('getTopSongs error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data top songs.')
    );
  }
};

/**
 * Top 10 artis paling sering diputar.
 */
export const getTopArtists = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.$queryRaw<{ artist: string; count: bigint }[]>`
      SELECT s."artist", COUNT(*)::bigint as count
      FROM "play_history" ph
      JOIN "songs" s ON ph."songId" = s."id"
      GROUP BY s."artist"
      ORDER BY count DESC
      LIMIT 10
    `;

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Top artists berhasil diambil.', 
        data.map((r) => ({ ...r, count: Number(r.count) }))
      )
    );
  } catch (error) {
    console.error('getTopArtists error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data top artists.')
    );
  }
};

/**
 * Distribusi genre dari lagu yang disukai user.
 */
export const getGenreDistribution = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.$queryRaw<{ genre: string; count: bigint }[]>`
      SELECT "genre", COUNT(*)::bigint as count
      FROM "liked_songs"
      WHERE "genre" IS NOT NULL AND "genre" != ''
      GROUP BY "genre"
      ORDER BY count DESC
      LIMIT 10
    `;

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Distribusi genre berhasil diambil.', 
        data.map((r) => ({ ...r, count: Number(r.count) }))
      )
    );
  } catch (error) {
    console.error('getGenreDistribution error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data distribusi genre.')
    );
  }
};
