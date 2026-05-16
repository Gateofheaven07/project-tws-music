"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertUserReview = exports.getReviewByUser = exports.getPublicReviews = void 0;
const prisma_1 = require("../lib/prisma");
const reviewUserSelect = {
    id: true,
    username: true,
    avatar: true,
};
const reviewInclude = {
    user: {
        select: reviewUserSelect,
    },
};
const getPublicReviews = async () => {
    const [reviews, total, ratingAggregate] = await Promise.all([
        prisma_1.prisma.appReview.findMany({
            orderBy: {
                updatedAt: 'desc',
            },
            take: 6,
            include: reviewInclude,
        }),
        prisma_1.prisma.appReview.count(),
        prisma_1.prisma.appReview.aggregate({
            _avg: {
                rating: true,
            },
        }),
    ]);
    const averageRating = ratingAggregate._avg.rating
        ? Number(ratingAggregate._avg.rating.toFixed(1))
        : 0;
    return {
        reviews,
        meta: {
            total,
            averageRating,
        },
    };
};
exports.getPublicReviews = getPublicReviews;
const getReviewByUser = async (userId) => {
    return prisma_1.prisma.appReview.findUnique({
        where: { userId },
        include: reviewInclude,
    });
};
exports.getReviewByUser = getReviewByUser;
const upsertUserReview = async (userId, rating, review) => {
    return prisma_1.prisma.appReview.upsert({
        where: { userId },
        update: {
            rating,
            review,
        },
        create: {
            userId,
            rating,
            review,
        },
        include: reviewInclude,
    });
};
exports.upsertUserReview = upsertUserReview;
