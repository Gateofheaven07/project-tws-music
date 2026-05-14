"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToHistory = exports.getHistory = void 0;
const prisma_1 = require("../lib/prisma");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
/**
 * Ngambil riwayat lagu yang baru diputer.
 */
const getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const history = await prisma_1.prisma.playHistory.findMany({
            where: { userId },
            include: {
                song: true,
            },
            orderBy: {
                playedAt: 'desc',
            },
            take: 50, // Ambil 50 lagu terakhir aja
        });
        const results = history.map((h) => h.song);
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Riwayat putar kamu.', results));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil riwayat.'));
    }
};
exports.getHistory = getHistory;
/**
 * Nyatet lagu yang baru aja diputer.
 */
const addToHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { songId, title, artist, album, thumbnail, duration } = req.body;
        if (!songId)
            return res.sendStatus(constants_1.HTTP_STATUS.BAD_REQUEST);
        // Pastiin lagunya ada
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
        // Catat ke history
        await prisma_1.prisma.playHistory.create({
            data: {
                userId,
                songId,
            }
        });
        return res.status(constants_1.HTTP_STATUS.CREATED).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.CREATED, 'Riwayat dicatat.'));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal nyatet riwayat.'));
    }
};
exports.addToHistory = addToHistory;
