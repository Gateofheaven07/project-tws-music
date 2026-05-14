import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createAccessToken, createRefreshToken } from '@/lib/auth/jwt';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/api/constants';

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.BAD_REQUEST,
          'Email, username, and password are required'
        ),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.CONFLICT,
          ERROR_MESSAGES.USER_ALREADY_EXISTS
        ),
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

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
      createSuccessResponse(HTTP_STATUS.CREATED, 'User registered successfully', {
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
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('[v0] Register error:', error);
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
