import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS } from '@/lib/api/constants';

// DELETE remove song from favorites
const deleteHandler = async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ songId: string }> }
) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { songId } = await params;

    // Remove from favorites
    await prisma.favorite.deleteMany({
      where: {
        userId: request.user.userId,
        songId,
      },
    });

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Removed from favorites'),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Remove favorite error:', error);
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

export const DELETE = withAuth(deleteHandler);
