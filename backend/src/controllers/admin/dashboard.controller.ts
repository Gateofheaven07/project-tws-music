import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { HTTP_STATUS } from '../../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';

/**
 * Ambil ringkasan statistik platform buat ditampilin di dashboard admin.
 */
export const getStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisWeek,
      totalPlaylists,
      totalLikedSongs,
      totalPlays,
      totalReviews,
      avgRating,
      recentUsers,
      recentReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.playlist.count(),
      prisma.likedSong.count(),
      prisma.playHistory.count(),
      prisma.appReview.count(),
      prisma.appReview.aggregate({ _avg: { rating: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          authProvider: true,
          createdAt: true,
        },
      }),
      prisma.appReview.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      }),
    ]);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Dashboard stats berhasil diambil.', {
        stats: {
          totalUsers,
          newUsersThisWeek,
          totalPlaylists,
          totalLikedSongs,
          totalPlays,
          totalReviews,
          averageRating: avgRating._avg.rating
            ? Number(avgRating._avg.rating.toFixed(1))
            : 0,
        },
        recentUsers,
        recentReviews,
      })
    );
  } catch (error) {
    console.error('Dashboard getStats error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data dashboard.')
    );
  }
};

/**
 * Ambil data buat chart-chart di dashboard.
 * - Registrasi per hari (30 hari terakhir)
 * - Top 10 lagu paling sering diputar
 * - Breakdown auth provider
 * - Play count per hari (30 hari terakhir)
 */
export const getCharts = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Registrasi per hari (30 hari)
    const registrations = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "users"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // 2. Top 10 lagu paling sering diputar
    const topSongs = await prisma.$queryRaw<{ title: string; artist: string; count: bigint }[]>`
      SELECT s."title", s."artist", COUNT(*)::bigint as count
      FROM "play_history" ph
      JOIN "songs" s ON ph."songId" = s."id"
      GROUP BY s."title", s."artist"
      ORDER BY count DESC
      LIMIT 10
    `;

    // 3. Auth provider breakdown
    const authProviders = await prisma.$queryRaw<{ provider: string; count: bigint }[]>`
      SELECT "authProvider" as provider, COUNT(*)::bigint as count
      FROM "users"
      GROUP BY "authProvider"
    `;

    // 4. Play count per hari (30 hari)
    const dailyPlays = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("playedAt") as date, COUNT(*)::bigint as count
      FROM "play_history"
      WHERE "playedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("playedAt")
      ORDER BY date ASC
    `;

    // Konversi bigint jadi number biar JSON-friendly
    const serialize = (rows: { date?: string; count: bigint; [key: string]: any }[]) =>
      rows.map((r) => ({ ...r, count: Number(r.count) }));

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Chart data berhasil diambil.', {
        registrations: serialize(registrations),
        topSongs: serialize(topSongs),
        authProviders: serialize(authProviders),
        dailyPlays: serialize(dailyPlays),
      })
    );
  } catch (error) {
    console.error('Dashboard getCharts error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data chart.')
    );
  }
};
