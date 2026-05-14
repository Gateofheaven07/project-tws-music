import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS } from '@/lib/api/constants';

// GET playlist by ID
const getHandler = async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            song: true,
          },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.NOT_FOUND,
          'Playlist not found'
        ),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check authorization
    if (playlist.userId !== request.user?.userId && !playlist.isPublic) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.FORBIDDEN,
          'Unauthorized access to this playlist'
        ),
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Playlist fetched', playlist),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Get playlist error:', error);
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

// DELETE playlist
const deleteHandler = async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { id } = await params;

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        userId: request.user.userId,
      },
    });

    if (!playlist) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.NOT_FOUND,
          'Playlist not found'
        ),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Delete playlist (cascade will delete songs)
    await prisma.playlist.delete({
      where: { id },
    });

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Playlist deleted'),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Delete playlist error:', error);
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

export const GET = getHandler;
export const DELETE = withAuth(deleteHandler);
