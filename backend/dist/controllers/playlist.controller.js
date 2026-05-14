"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlaylist = exports.getPlaylistDetail = exports.addSongToPlaylist = exports.createPlaylist = exports.getMyPlaylists = void 0;
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
        const { playlistId } = req.params;
        const { songId, title, artist, album, thumbnail, duration } = req.body;
        // Pastiin lagunya ada di cache
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
        const playlistSong = await prisma_1.prisma.playlistSong.create({
            data: {
                playlistId: playlistId,
                songId,
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
        const { id } = req.params;
        const playlist = await prisma_1.prisma.playlist.findUnique({
            where: { id: id },
            include: {
                songs: {
                    include: {
                        song: true
                    }
                }
            }
        });
        if (!playlist) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu.'));
        }
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Detail playlist.', playlist));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil detail playlist.'));
    }
};
exports.getPlaylistDetail = getPlaylistDetail;
/**
 * Hapus playlist.
 */
const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        // Pastiin playlist-nya punya user yang login
        const playlist = await prisma_1.prisma.playlist.findFirst({
            where: { id: id, userId }
        });
        if (!playlist) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'Playlist nggak ketemu atau kamu nggak punya akses.'));
        }
        await prisma_1.prisma.playlist.delete({
            where: { id: id }
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Playlist berhasil dihapus.'));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngehapus playlist.'));
    }
};
exports.deletePlaylist = deletePlaylist;
