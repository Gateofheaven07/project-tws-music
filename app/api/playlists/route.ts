import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS } from '@/lib/api/constants';

// GET all playlists for current user
const getHandler = async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId: request.user.userId },
      include: {
        songs: {
          include: {
            song: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Playlists fetched', playlists),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Get playlists error:', error);
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

// POST create new playlist
const postHandler = async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { name, description, isPublic } = await request.json();

    if (!name) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.BAD_REQUEST,
          'Playlist name is required'
        ),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const playlist = await prisma.playlist.create({
      data: {
        userId: request.user.userId,
        name,
        description: description || '',
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Playlist created', playlist),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('[v0] Create playlist error:', error);
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
