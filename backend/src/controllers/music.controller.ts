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
      createSuccessResponse(HTTP_STATUS.OK, `Hasil pencarian buat "${q}"`, results)
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
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar lagu trending hari ini.', results)
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

    const videoId = await musicService.getYouTubeId(artist as string, title as string);

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
    const { id } = req.params;
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
    const { id } = req.params;
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
