"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavorite = exports.addFavorite = exports.getFavorites = void 0;
const prisma_1 = require("../lib/prisma");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
/**
 * Ngambil semua lagu favorit user.
 */
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const favorites = await prisma_1.prisma.favorite.findMany({
            where: { userId },
            include: {
                song: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Kita mapping biar formatnya seragam sama hasil search
        const results = favorites.map((f) => ({
            musicId: f.song.id.startsWith('music_') ? f.song.id : `music_dz_${f.song.id}`,
            title: f.song.title,
            artist: {
                id: `artist_unknown`,
                name: f.song.artist
            },
            album: {
                id: `album_unknown`,
                name: f.song.album,
                cover: {
                    small: f.song.thumbnail,
                    medium: f.song.thumbnail,
                    big: f.song.thumbnail,
                    xl: f.song.thumbnail
                }
            },
            duration: f.song.duration,
            genres: [],
            releaseDate: "",
            playback: {
                provider: "youtube",
                type: "iframe",
                videoId: f.song.youtubeUrl,
                embedUrl: f.song.youtubeUrl ? `https://www.youtube.com/embed/${f.song.youtubeUrl}` : null,
                youtubeUrl: f.song.youtubeUrl ? `https://www.youtube.com/watch?v=${f.song.youtubeUrl}` : null
            },
            statistics: {
                popularity: 0
            }
        }));
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Daftar lagu favorit kamu.', results, {
            total: results.length,
            provider: {
                metadata: "database",
                playback: "youtube"
            }
        }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil daftar favorit.'));
    }
};
exports.getFavorites = getFavorites;
/**
 * Tambah lagu ke favorit.
 */
const addFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { songId, title, artist, album, thumbnail, duration } = req.body;
        if (!songId) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'ID Lagunya mana?'));
        }
        // Pastiin lagunya ada di cache/table Song dulu
        await prisma_1.prisma.song.upsert({
            where: { id: songId },
            update: {},
            create: {
                id: songId,
                title: title || 'Unknown',
                artist: artist || 'Unknown',
                album: album || '',
                thumbnail: thumbnail || '',
                duration: duration || 0,
            },
        });
        // Tambah ke favorit
        const favorite = await prisma_1.prisma.favorite.upsert({
            where: {
                userId_songId: { userId, songId },
            },
            update: {},
            create: {
                userId,
                songId,
            },
        });
        return res.status(constants_1.HTTP_STATUS.CREATED).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.CREATED, 'Lagu berhasil ditambah ke favorit.', favorite));
    }
    catch (error) {
        console.error('Add Favorite Error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal nambahin ke favorit.'));
    }
};
exports.addFavorite = addFavorite;
/**
 * Hapus lagu dari favorit.
 */
const removeFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const songId = req.params.songId;
        await prisma_1.prisma.favorite.delete({
            where: {
                userId_songId: { userId, songId },
            },
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Lagu dihapus dari favorit.'));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngehapus dari favorit.'));
    }
};
exports.removeFavorite = removeFavorite;
