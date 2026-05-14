import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS } from '@/lib/api/constants';

// GET all favorite songs for current user
const getHandler = async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: request.user.userId },
      include: {
        song: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const songs = favorites.map((fav) => fav.song);

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Favorites fetched', songs),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Get favorites error:', error);
    return NextResponse.json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Internal server error',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

// POST add song to favorites
const postHandler = async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { songId } = await request.json();

    if (!songId) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.BAD_REQUEST,
          'Song ID is required'
        ),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.NOT_FOUND,
          'Song not found'
        ),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Add to favorites (ignore if already exists)
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_songId: {
          userId: request.user.userId,
          songId,
        },
      },
      update: {},
      create: {
        userId: request.user.userId,
        songId,
      },
    });

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Added to favorites', favorite),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('[v0] Add favorite error:', error);
    return NextResponse.json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Internal server error',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
