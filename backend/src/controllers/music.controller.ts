import { Request, Response } from 'express';
import * as musicService from '../services/music.service';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

/**
 * Nyari lagu berdasarkan keyword.
 */
export const search = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Mau nyari apa? Masukin keyword-nya dong.')
      );
    }

    const results = await musicService.searchSongs(q);
    
    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, `Search result for "${q}"`, results, {
        query: q,
        total: results.length,
        provider: {
          metadata: "deezer",
          playback: "youtube"
        }
      })
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};

/**
 * Ngambil lagu-lagu yang lagi hits.
 */
export const trending = async (req: Request, res: Response) => {
  try {
    const results = await musicService.getTrendingSongs();
    
    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar lagu trending hari ini.', results, {
        total: results.length,
        provider: {
          metadata: "deezer",
          playback: "youtube"
        }
      })
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};

/**
 * Ngambil rekomendasi berdasarkan genre yang paling sering disukai user.
 */
export const recommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as string;
    const recommendations = await musicService.getRecommendationsForUser(userId);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(
        HTTP_STATUS.OK,
        `Rekomendasi berdasarkan genre ${recommendations.favoriteGenre}.`,
        recommendations.results,
        {
          query: recommendations.query,
          total: recommendations.results.length,
          favoriteGenre: recommendations.favoriteGenre,
          source: recommendations.source,
          provider: {
            metadata: "deezer",
            playback: "youtube"
          },
          playbackStatus: recommendations.playbackStatus
        }
      )
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};

/**
 * Ngambil kategori musik dari Deezer.
 */
export const genres = async (req: Request, res: Response) => {
  try {
    const results = await musicService.getGenres();

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar kategori musik berhasil diambil.', results, {
        total: results.length,
        provider: {
          metadata: "deezer",
          playback: "youtube"
        }
      })
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};

/**
 * Ngambil lagu yang mewakili satu genre Deezer.
 */
export const genreSongs = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const name = typeof req.query.name === 'string' ? req.query.name : undefined;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Genre yang mau dibuka belum dipilih.')
      );
    }

    const genreSongs = await musicService.getSongsByGenre(id, name);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, `Genre songs for ${name || id}`, genreSongs.results, {
        query: genreSongs.query,
        total: genreSongs.results.length,
        provider: {
          metadata: "deezer",
          playback: "youtube"
        },
        playbackStatus: genreSongs.playbackStatus
      })
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};

/**
 * Ngambil video ID YouTube buat diputer.
 */
export const getStreamId = async (req: Request, res: Response) => {
  try {
    const { artist, title } = req.query;

    if (!artist || !title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Artist sama judul lagunya jangan lupa ya.')
      );
    }

    const playbackLookup = await musicService.getYouTubeId(artist as string, title as string);
    const { videoId } = playbackLookup;

    if (!videoId) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'Duh, sumber audio lagunya nggak ketemu di YouTube.')
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Dapet nih video ID-nya.', { videoId })
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};

/**
 * Ngambil detail lengkap artis.
 */
export const getArtist = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await musicService.getArtistDetails(id);
    
    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Detail artis berhasil diambil.', result)
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};

/**
 * Ngambil detail lengkap album.
 */
export const getAlbum = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await musicService.getAlbumDetails(id);
    
    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Detail album berhasil diambil.', result)
    );
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message)
    );
  }
};
