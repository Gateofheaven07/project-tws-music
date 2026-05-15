"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavorite = exports.addFavorite = exports.getFavorites = void 0;
const prisma_1 = require("../lib/prisma");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
/**
 * Ngambil semua lagu yang disukai user.
 */
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const likedSongs = await prisma_1.prisma.likedSong.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Kita mapping biar formatnya seragam sama hasil search
        const results = likedSongs.map((f) => ({
            musicId: f.musicId,
            title: f.title,
            artist: {
                id: `artist_unknown`,
                name: f.artist
            },
            album: {
                id: `album_unknown`,
                name: "",
                cover: {
                    small: f.cover,
                    medium: f.cover,
                    big: f.cover,
                    xl: f.cover
                }
            },
            duration: f.duration,
            genres: [],
            releaseDate: "",
            playback: {
                provider: "youtube",
                type: "iframe",
                videoId: f.videoId,
                embedUrl: f.videoId ? `https://www.youtube.com/embed/${f.videoId}` : null,
                youtubeUrl: f.videoId ? `https://www.youtube.com/watch?v=${f.videoId}` : null
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
        const { musicId, title, artist, cover, duration, videoId } = req.body;
        if (!musicId) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'ID Lagunya mana?'));
        }
        // Tambah ke likedSongs
        const likedSong = await prisma_1.prisma.likedSong.upsert({
            where: {
                userId_musicId: { userId, musicId },
            },
            update: {},
            create: {
                userId,
                musicId,
                title: title || 'Unknown',
                artist: artist || 'Unknown',
                cover: cover || '',
                duration: duration || 0,
                videoId: videoId || null,
            },
        });
        return res.status(constants_1.HTTP_STATUS.CREATED).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.CREATED, 'Lagu berhasil ditambah ke favorit.', likedSong));
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
        const musicId = (req.params.musicId || req.params.songId);
        await prisma_1.prisma.likedSong.delete({
            where: {
                userId_musicId: { userId, musicId },
            },
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Lagu dihapus dari favorit.'));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngehapus dari favorit.'));
    }
};
exports.removeFavorite = removeFavorite;
