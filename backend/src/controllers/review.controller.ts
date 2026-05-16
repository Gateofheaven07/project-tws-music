import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const normalizeReviewPayload = (body: any) => {
  const rating = Number(body?.rating);
  const review = typeof body?.review === 'string' ? body.review.trim() : '';

  return { rating, review };
};

/**
 * Ngambil ulasan yang tampil di landing page.
 */
export const getReviews = async (_req: Request, res: Response) => {
  try {
    const result = await reviewService.getPublicReviews();

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(
        HTTP_STATUS.OK,
        'Daftar ulasan Soundwave berhasil diambil.',
        result.reviews,
        result.meta,
      )
    );
  } catch (error) {
    console.error('Get Reviews Error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil daftar ulasan.')
    );
  }
};

/**
 * Ngambil ulasan milik user yang sedang login.
 */
export const getMyReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const review = await reviewService.getReviewByUser(userId);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Ulasan kamu berhasil diambil.', review)
    );
  } catch (error) {
    console.error('Get My Review Error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil ulasan kamu.')
    );
  }
};

/**
 * Bikin atau update ulasan user. Submit berikutnya akan memperbarui ulasan lama.
 */
export const upsertMyReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const { rating, review } = normalizeReviewPayload(req.body);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Rating harus berupa angka 1 sampai 5.')
      );
    }

    if (!review || review.length < 12) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Ulasan terlalu singkat. Ceritakan sedikit pengalaman kamu.')
      );
    }

    if (review.length > 180) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Ulasan maksimal 180 karakter.')
      );
    }

    const savedReview = await reviewService.upsertUserReview(userId, rating, review);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Ulasan kamu berhasil disimpan.', savedReview)
    );
  } catch (error) {
    console.error('Upsert Review Error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal menyimpan ulasan kamu.')
    );
  }
};
