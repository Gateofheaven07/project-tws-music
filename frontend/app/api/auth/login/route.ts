import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createAccessToken, createRefreshToken } from '@/lib/auth/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/api/constants';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.BAD_REQUEST,
          'Email and password are required'
        ),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_MESSAGES.INVALID_CREDENTIALS
        ),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_MESSAGES.INVALID_CREDENTIALS
        ),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Create tokens
    const accessToken = createAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = createRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Return success response
    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Login successful', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      }),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.SERVER_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
