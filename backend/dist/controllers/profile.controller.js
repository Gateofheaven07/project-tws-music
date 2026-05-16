"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileHistory = exports.updateAvatar = exports.updatePassword = exports.updateUsername = exports.getProfile = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = require("../lib/prisma");
const password_1 = require("../lib/auth/password");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
// Helper untuk dapetin base URL server (buat bikin URL avatar yang lengkap)
const getBaseUrl = (req) => {
    return `${req.protocol}://${req.get('host')}`;
};
/**
 * Ambil data profil user yang sedang login.
 * Hanya kembalikan field yang aman, password hash jangan sampai bocor ke frontend.
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.'));
        }
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'User profile fetched successfully', {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt,
        }));
    }
    catch (error) {
        console.error('getProfile error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal mengambil data profil.'));
    }
};
exports.getProfile = getProfile;
/**
 * Update username user.
 * Cek dulu apakah username baru sudah dipakai user lain.
 */
const updateUsername = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { username } = req.body;
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Username minimal 3 karakter.'));
        }
        const trimmedUsername = username.trim();
        // Pastikan username belum dipakai user lain
        const existing = await prisma_1.prisma.user.findFirst({
            where: {
                username: trimmedUsername,
                NOT: { id: userId },
            },
        });
        if (existing) {
            return res.status(constants_1.HTTP_STATUS.CONFLICT).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.CONFLICT, 'Username sudah dipakai orang lain, coba yang lain ya.'));
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { username: trimmedUsername },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
            },
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Username updated successfully', {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
        }));
    }
    catch (error) {
        console.error('updateUsername error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal update username.'));
    }
};
exports.updateUsername = updateUsername;
/**
 * Update password user.
 * User harus masukkan password lama yang benar dulu sebelum bisa ganti password baru.
 */
const updatePassword = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Password lama dan password baru wajib diisi.'));
        }
        if (newPassword.length < 6) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Password baru minimal 6 karakter.'));
        }
        // Ambil password hash yang tersimpan di database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        if (!user) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.'));
        }
        // Verifikasi password lama
        const isPasswordValid = await (0, password_1.verifyPassword)(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Current password is incorrect'));
        }
        // Hash password baru lalu simpan
        const hashedNewPassword = await (0, password_1.hashPassword)(newPassword);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Password updated successfully'));
    }
    catch (error) {
        console.error('updatePassword error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal update password.'));
    }
};
exports.updatePassword = updatePassword;
/**
 * Update foto profil (avatar) user.
 * File sudah diproses oleh multer middleware sebelum masuk ke sini.
 * Hapus avatar lama dari disk kalau ada, lalu simpan URL avatar baru ke database.
 */
const updateAvatar = async (req, res) => {
    try {
        const userId = req.user?.userId;
        // Multer udah handle upload-nya, file ada di req.file
        if (!req.file) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Tidak ada file yang diupload.'));
        }
        const baseUrl = getBaseUrl(req);
        const avatarUrl = `${baseUrl}/uploads/avatar/${req.file.filename}`;
        // Ambil avatar lama dari DB untuk dihapus dari disk
        const currentUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true },
        });
        // Hapus file avatar lama dari disk kalau ada dan bukan URL eksternal
        if (currentUser?.avatar) {
            const oldAvatarUrl = currentUser.avatar;
            // Cek apakah avatar lama adalah file lokal (bukan URL eksternal)
            if (oldAvatarUrl.includes('/uploads/avatar/')) {
                const filename = oldAvatarUrl.split('/uploads/avatar/')[1];
                const oldFilePath = path_1.default.join(process.cwd(), 'uploads', 'avatar', filename);
                if (fs_1.default.existsSync(oldFilePath)) {
                    fs_1.default.unlinkSync(oldFilePath);
                }
            }
        }
        // Simpan URL avatar baru ke database
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
            select: { id: true, avatar: true },
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Profile avatar updated successfully', {
            id: updatedUser.id,
            avatar: updatedUser.avatar,
        }));
    }
    catch (error) {
        console.error('updateAvatar error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal update avatar.'));
    }
};
exports.updateAvatar = updateAvatar;
/**
 * Ambil riwayat lagu yang pernah diputar user untuk ditampilkan di halaman profil.
 * Format responsenya disesuaikan biar frontend bisa langsung memutar ulang lagunya.
 */
const getProfileHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const history = await prisma_1.prisma.playHistory.findMany({
            where: { userId },
            include: {
                song: true,
            },
            orderBy: {
                playedAt: 'desc',
            },
            take: 50,
        });
        const results = history.map((h) => ({
            id: h.id,
            musicId: h.song.id.startsWith('music_') ? h.song.id : `music_dz_${h.song.id}`,
            title: h.song.title,
            artist: h.song.artist,
            cover: h.song.thumbnail || '',
            duration: h.song.duration,
            videoId: h.song.youtubeUrl || null,
            playedAt: h.playedAt,
        }));
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Play history fetched successfully', results, {
            total: results.length,
        }));
    }
    catch (error) {
        console.error('getProfileHistory error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal mengambil riwayat putar.'));
    }
};
exports.getProfileHistory = getProfileHistory;
