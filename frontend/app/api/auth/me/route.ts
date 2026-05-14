import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/api/constants';

const handler = async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_MESSAGES.UNAUTHORIZED
        ),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.NOT_FOUND,
          ERROR_MESSAGES.USER_NOT_FOUND
        ),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'User fetched successfully', user),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Get current user error:', error);
    return NextResponse.json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.SERVER_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const GET = withAuth(handler);
