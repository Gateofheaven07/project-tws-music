import { NextRequest, NextResponse } from 'next/server';
import { searchMusicViaDeezer, cacheMusicToDB } from '@/lib/music/service';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS } from '@/lib/api/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        createErrorResponse(
          HTTP_STATUS.BAD_REQUEST,
          'Search query is required'
        ),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Search music via Deezer
    const results = await searchMusicViaDeezer(query);

    if (results.length === 0) {
      return NextResponse.json(
        createSuccessResponse(HTTP_STATUS.OK, 'No results found', []),
        { status: HTTP_STATUS.OK }
      );
    }

    // Cache results to database
    const cachedResults = await Promise.all(
      results.map((music) => cacheMusicToDB(music))
    );

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Search successful', cachedResults),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Music search error:', error);
    return NextResponse.json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Internal server error',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
