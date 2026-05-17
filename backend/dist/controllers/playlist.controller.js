"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSongFromPlaylist = exports.deletePlaylist = exports.updatePlaylist = exports.getPlaylistDetail = exports.addSongToPlaylist = exports.createPlaylist = exports.getMyPlaylists = void 0;
const prisma_1 = require("../lib/prisma");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
/**
 * Ngambil semua playlist milik user.
 */
const getMyPlaylists = async (req, res) => {
    try {
        const userId = req.user.userId;
        const playlists = await prisma_1.prisma.playlist.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { songs: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Daftar playlist kamu.', playlists));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil playlist.'));
    }
};
exports.getMyPlaylists = getMyPlaylists;
/**
 * Bikin playlist baru.
 */
const createPlaylist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, description, isPublic } = req.body;
        if (!name) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Nama playlist-nya jangan lupa diisi.'));
        }
        const playlist = await prisma_1.prisma.playlist.create({
            data: {
                userId,
                name,
                description,
                isPublic: isPublic || false,
            }
        });
        return res.status(constants_1.HTTP_STATUS.CREATED).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.CREATED, 'Playlist berhasil dibuat.', playlist));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal bikin playlist.'));
    }
};
exports.createPlaylist = createPlaylist;
/**
 * Nambahin lagu ke playlist.
 */
const addSongToPlaylist = async (req, res) => {
    try {
        const playlistId = (req.params.playlistId || req.params.id); // Support both params based on route
        const userId = req.user.userId;
        const { musicId, title, artist, cover, duration, videoId } = req.body;
        if (!musicId) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'ID Lagunya mana?'));
        }
        const playlist = await prisma_1.prisma.playlist.findFirst({
            where: { id: playlistId, userId }
        });
        if (!playlist) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu atau kamu nggak punya akses.'));
        }
        const playlistSong = await prisma_1.prisma.playlistSong.upsert({
            where: {
                playlistId_musicId: { playlistId, musicId },
            },
            update: {},
            create: {
                playlistId,
                musicId,
                title: title || 'Unknown',
                artist: artist || 'Unknown',
                cover: cover || '',
                duration: duration || 0,
                videoId: videoId || null,
            }
        });
        return res.status(constants_1.HTTP_STATUS.CREATED).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.CREATED, 'Lagu berhasil ditambah ke playlist.', playlistSong));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal nambahin lagu ke playlist.'));
    }
};
exports.addSongToPlaylist = addSongToPlaylist;
/**
 * Ambil detail playlist beserta lagu-lagunya.
 */
const getPlaylistDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const playlist = await prisma_1.prisma.playlist.findFirst({
            where: { id, userId },
            include: {
                songs: {
                    orderBy: {
                        addedAt: 'desc'
                    }
                }
            }
        });
        if (!playlist) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu.'));
        }
        // Mapping songs to unified format
        const songs = playlist.songs.map((ps) => ({
            musicId: ps.musicId,
            title: ps.title,
            artist: {
                id: `artist_unknown`,
                name: ps.artist
            },
            album: {
                id: `album_unknown`,
                name: "",
                cover: {
                    small: ps.cover,
                    medium: ps.cover,
                    big: ps.cover,
                    xl: ps.cover
                }
            },
            duration: ps.duration,
            genres: [],
            releaseDate: "",
            playback: {
                provider: "youtube",
                type: "iframe",
                videoId: ps.videoId,
                embedUrl: ps.videoId ? `https://www.youtube.com/embed/${ps.videoId}` : null,
                youtubeUrl: ps.videoId ? `https://www.youtube.com/watch?v=${ps.videoId}` : null
            },
            statistics: {
                popularity: 0
            }
        }));
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Detail playlist.', { ...playlist, songs }, {
            total: songs.length,
            provider: {
                metadata: "database",
                playback: "youtube"
            }
        }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil detail playlist.'));
    }
};
exports.getPlaylistDetail = getPlaylistDetail;
/**
 * Edit nama dan deskripsi playlist.
 */
const updatePlaylist = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const { name, description } = req.body;
        const cleanName = typeof name === 'string' ? name.trim() : '';
        const cleanDescription = typeof description === 'string' ? description.trim() : '';
        if (!cleanName) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Nama playlist wajib diisi.'));
        }
        const playlist = await prisma_1.prisma.playlist.findFirst({
            where: { id, userId }
        });
        if (!playlist) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu atau kamu nggak punya akses.'));
        }
        const updatedPlaylist = await prisma_1.prisma.playlist.update({
            where: { id },
            data: {
                name: cleanName,
                description: cleanDescription || null,
            },
            include: {
                _count: {
                    select: { songs: true }
                }
            }
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Playlist berhasil diperbarui.', updatedPlaylist));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal memperbarui playlist.'));
    }
};
exports.updatePlaylist = updatePlaylist;
/**
 * Hapus playlist.
 */
const deletePlaylist = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        // Pastiin playlist-nya punya user yang login
        const playlist = await prisma_1.prisma.playlist.findFirst({
            where: { id, userId }
        });
        if (!playlist) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu atau kamu nggak punya akses.'));
        }
        await prisma_1.prisma.playlist.delete({
            where: { id }
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Playlist berhasil dihapus.'));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngehapus playlist.'));
    }
};
exports.deletePlaylist = deletePlaylist;
/**
 * Hapus lagu dari playlist.
 */
const removeSongFromPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const musicId = req.params.musicId;
        const userId = req.user.userId;
        // Pastiin playlist milik user yang request
        const playlist = await prisma_1.prisma.playlist.findFirst({
            where: { id: playlistId, userId }
        });
        if (!playlist) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu atau kamu nggak punya akses.'));
        }
        await prisma_1.prisma.playlistSong.delete({
            where: {
                playlistId_musicId: { playlistId, musicId },
            },
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Lagu berhasil dihapus dari playlist.'));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngehapus lagu dari playlist.'));
    }
};
exports.removeSongFromPlaylist = removeSongFromPlaylist;
