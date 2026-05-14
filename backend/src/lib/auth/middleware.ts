import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, TokenPayload } from './jwt';
import { createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/api/constants';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export const verifyAuth = (request: NextRequest): TokenPayload | null => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    console.error('[v0] No authorization header');
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.error('[v0] Invalid authorization header format');
    return null;
  }

  const token = parts[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    console.error('[v0] Invalid or expired token');
    return null;
  }

  return payload;
};

export const withAuth = (
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_MESSAGES.INVALID_TOKEN
        ),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const authRequest = request as AuthenticatedRequest;
    authRequest.user = user;

    return handler(authRequest);
  };
};
