import { NextRequest, NextResponse } from 'next/server';
import { getTrendingSongs, cacheMusicToDB } from '@/lib/music/service';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { HTTP_STATUS } from '@/lib/api/constants';

export async function GET(request: NextRequest) {
  try {
    // Get trending songs from Deezer
    const trendingResults = await getTrendingSongs();

    if (trendingResults.length === 0) {
      return NextResponse.json(
        createSuccessResponse(HTTP_STATUS.OK, 'No trending songs found', []),
        { status: HTTP_STATUS.OK }
      );
    }

    // Cache results to database
    const cachedResults = await Promise.all(
      trendingResults.map((music) => cacheMusicToDB(music))
    );

    return NextResponse.json(
      createSuccessResponse(HTTP_STATUS.OK, 'Trending songs fetched', cachedResults),
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('[v0] Trending songs error:', error);
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
