"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertMyReview = exports.getMyReview = exports.getReviews = void 0;
const reviewService = __importStar(require("../services/review.service"));
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
const normalizeReviewPayload = (body) => {
    const rating = Number(body?.rating);
    const review = typeof body?.review === 'string' ? body.review.trim() : '';
    return { rating, review };
};
/**
 * Ngambil ulasan yang tampil di landing page.
 */
const getReviews = async (_req, res) => {
    try {
        const result = await reviewService.getPublicReviews();
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Daftar ulasan Soundwave berhasil diambil.', result.reviews, result.meta));
    }
    catch (error) {
        console.error('Get Reviews Error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil daftar ulasan.'));
    }
};
exports.getReviews = getReviews;
/**
 * Ngambil ulasan milik user yang sedang login.
 */
const getMyReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const review = await reviewService.getReviewByUser(userId);
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Ulasan kamu berhasil diambil.', review));
    }
    catch (error) {
        console.error('Get My Review Error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil ulasan kamu.'));
    }
};
exports.getMyReview = getMyReview;
/**
 * Bikin atau update ulasan user. Submit berikutnya akan memperbarui ulasan lama.
 */
const upsertMyReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { rating, review } = normalizeReviewPayload(req.body);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Rating harus berupa angka 1 sampai 5.'));
        }
        if (!review || review.length < 12) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Ulasan terlalu singkat. Ceritakan sedikit pengalaman kamu.'));
        }
        if (review.length > 180) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Ulasan maksimal 180 karakter.'));
        }
        const savedReview = await reviewService.upsertUserReview(userId, rating, review);
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Ulasan kamu berhasil disimpan.', savedReview));
    }
    catch (error) {
        console.error('Upsert Review Error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal menyimpan ulasan kamu.'));
    }
};
exports.upsertMyReview = upsertMyReview;
