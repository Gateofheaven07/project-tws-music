import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS } from '@/lib/api/constants';

// POST add song to playlist
const postHandler = async (
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

    // Add song to playlist
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: id,
        songId,
      },
    });

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Song added to playlist', playlistSong),
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('[v0] Add song to playlist error:', error);
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

// DELETE remove song from playlist
const deleteHandler = async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string; songId: string }> }
) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { id, songId } = await params;

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

    // Remove song from playlist
    await prisma.playlistSong.deleteMany({
      where: {
        playlistId: id,
        songId,
      },
    });

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Song removed from playlist'),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Remove song from playlist error:', error);
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

export const POST = withAuth(postHandler);
export const DELETE = withAuth(deleteHandler);
