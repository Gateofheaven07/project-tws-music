"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbum = exports.getArtist = exports.getStreamId = exports.genreSongs = exports.genres = exports.trending = exports.search = void 0;
const musicService = __importStar(require("../services/music.service"));
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
/**
 * Nyari lagu berdasarkan keyword.
 */
const search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Mau nyari apa? Masukin keyword-nya dong.'));
        }
        const results = await musicService.searchSongs(q);
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, `Search result for "${q}"`, results, {
            query: q,
            total: results.length,
            provider: {
                metadata: "deezer",
                playback: "youtube"
            }
        }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
    }
};
exports.search = search;
/**
 * Ngambil lagu-lagu yang lagi hits.
 */
const trending = async (req, res) => {
    try {
        const results = await musicService.getTrendingSongs();
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Daftar lagu trending hari ini.', results, {
            total: results.length,
            provider: {
                metadata: "deezer",
                playback: "youtube"
            }
        }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
    }
};
exports.trending = trending;
/**
 * Ngambil kategori musik dari Deezer.
 */
const genres = async (req, res) => {
    try {
        const results = await musicService.getGenres();
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Daftar kategori musik berhasil diambil.', results, {
            total: results.length,
            provider: {
                metadata: "deezer",
                playback: "youtube"
            }
        }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
    }
};
exports.genres = genres;
/**
 * Ngambil lagu yang mewakili satu genre Deezer.
 */
const genreSongs = async (req, res) => {
    try {
        const id = req.params.id;
        const name = typeof req.query.name === 'string' ? req.query.name : undefined;
        if (!id) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Genre yang mau dibuka belum dipilih.'));
        }
        const genreSongs = await musicService.getSongsByGenre(id, name);
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, `Genre songs for ${name || id}`, genreSongs.results, {
            query: genreSongs.query,
            total: genreSongs.results.length,
            provider: {
                metadata: "deezer",
                playback: "youtube"
            },
            playbackStatus: genreSongs.playbackStatus
        }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
    }
};
exports.genreSongs = genreSongs;
/**
 * Ngambil video ID YouTube buat diputer.
 */
const getStreamId = async (req, res) => {
    try {
        const { artist, title } = req.query;
        if (!artist || !title) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Artist sama judul lagunya jangan lupa ya.'));
        }
        const playbackLookup = await musicService.getYouTubeId(artist, title);
        const { videoId } = playbackLookup;
        if (!videoId) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Duh, sumber audio lagunya nggak ketemu di YouTube.'));
        }
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Dapet nih video ID-nya.', { videoId }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
    }
};
exports.getStreamId = getStreamId;
/**
 * Ngambil detail lengkap artis.
 */
const getArtist = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await musicService.getArtistDetails(id);
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Detail artis berhasil diambil.', result));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
    }
};
exports.getArtist = getArtist;
/**
 * Ngambil detail lengkap album.
 */
const getAlbum = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await musicService.getAlbumDetails(id);
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Detail album berhasil diambil.', result));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
    }
};
exports.getAlbum = getAlbum;
