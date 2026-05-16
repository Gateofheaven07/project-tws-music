import { prisma } from '../lib/prisma';

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

export const getPublicReviews = async () => {
  const [reviews, total, ratingAggregate] = await Promise.all([
    prisma.appReview.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      take: 6,
      include: reviewInclude,
    }),
    prisma.appReview.count(),
    prisma.appReview.aggregate({
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

export const getReviewByUser = async (userId: string) => {
  return prisma.appReview.findUnique({
    where: { userId },
    include: reviewInclude,
  });
};

export const upsertUserReview = async (userId: string, rating: number, review: string) => {
  return prisma.appReview.upsert({
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
