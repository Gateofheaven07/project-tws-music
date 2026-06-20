import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { HTTP_STATUS } from '../../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';

/**
 * Ambil semua ulasan dengan pagination dan filter.
 * Akses: ADMIN & SUPER_ADMIN
 */
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const rating = parseInt(req.query.rating as string);
    const sort = (req.query.sort as string) === 'oldest' ? 'asc' : 'desc';

    const where: any = {};

    // Filter by rating (1-5)
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      where.rating = rating;
    }

    const [reviews, total] = await Promise.all([
      prisma.appReview.findMany({
        where,
        orderBy: { updatedAt: sort as 'asc' | 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.appReview.count({ where }),
    ]);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar ulasan berhasil diambil.', reviews, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error('getAllReviews error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil daftar ulasan.')
    );
  }
};

/**
 * Hapus ulasan berdasarkan ID.
 * Akses: ADMIN & SUPER_ADMIN
 */
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const review = await prisma.appReview.findUnique({
      where: { id },
      include: { user: { select: { username: true } } },
    });

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'Ulasan tidak ditemukan.')
      );
    }

    await prisma.appReview.delete({ where: { id } });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, `Ulasan dari ${(review as any).user.username} berhasil dihapus.`)
    );
  } catch (error) {
    console.error('deleteReview error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal menghapus ulasan.')
    );
  }
};

/**
 * Membalas ulasan.
 * Akses: ADMIN & SUPER_ADMIN
 */
export const replyReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reply } = req.body;

    const review = await prisma.appReview.findUnique({
      where: { id },
      include: { user: { select: { username: true } } },
    });

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'Ulasan tidak ditemukan.')
      );
    }

    const updated = await prisma.appReview.update({
      where: { id },
      data: {
        adminReply: reply || null,
        repliedAt: reply ? new Date() : null,
      },
      include: {
        user: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
    });

    const msg = reply ? 'Balasan berhasil dikirim.' : 'Balasan berhasil dihapus.';
    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, msg, updated)
    );
  } catch (error) {
    console.error('replyReview error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal membalas ulasan.')
    );
  }
};
