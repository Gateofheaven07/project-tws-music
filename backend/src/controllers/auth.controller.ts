import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { createAccessToken, createRefreshToken } from '../lib/auth/jwt';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Email, username, and password are required')
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        createErrorResponse(HTTP_STATUS.CONFLICT, ERROR_MESSAGES.USER_ALREADY_EXISTS)
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

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

    return res.status(HTTP_STATUS.CREATED).json(
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
      })
    );
  } catch (error) {
    console.error('Register error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.SERVER_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Email and password are required')
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS)
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS)
      );
    }

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

    return res.status(HTTP_STATUS.OK).json(
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
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.SERVER_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
};

export const getMe = async (req: Request, res: Response) => {
  // Logic will be implemented with middleware to populate req.user
  return res.json({ message: 'Get Me endpoint' });
};
