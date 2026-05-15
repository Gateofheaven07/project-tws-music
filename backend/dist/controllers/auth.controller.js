"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.register = void 0;
const prisma_1 = require("../lib/prisma");
const password_1 = require("../lib/auth/password");
const jwt_1 = require("../lib/auth/jwt");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
/**
 * Controller buat nanganin pendaftaran user baru.
 * Kita bakal ngecek dulu apa email/username udah kepake atau belum.
 */
const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        // Validasi input sederhana, nanti bisa ditambah Zod kalau mau lebih ketat
        if (!email || !username || !password) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Email, username, sama password wajib diisi ya.'));
        }
        // Cek dulu apa user udah terdaftar
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (existingUser) {
            return res.status(constants_1.HTTP_STATUS.CONFLICT).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.CONFLICT, 'Wah, email atau username ini udah ada yang punya.'));
        }
        // Amankan password sebelum disimpen
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // Bikin user baru di database
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });
        // Kita hapus bagian pembuatan token otomatis di sini. 
        // Jadi user harus login manual setelah akunnya berhasil dibuat.
        return res.status(constants_1.HTTP_STATUS.CREATED).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.CREATED, 'Yeay! Akun kamu berhasil dibuat. Silakan login ya.', {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
            }
        }));
    }
    catch (error) {
        console.error('Register error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Aduh, server lagi pusing nih pas mau daftarin kamu.', error instanceof Error ? error.message : 'Unknown error'));
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.BAD_REQUEST, 'Email sama password jangan sampe kosong ya.'));
        }
        // Cari user berdasarkan email
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Email atau password kamu salah, coba cek lagi deh.'));
        }
        // Cek passwordnya cocok apa nggak
        const isPasswordValid = await (0, password_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Email atau password kamu salah, coba cek lagi deh.'));
        }
        // Kalo cocok, kasih token buat akses API
        const accessToken = (0, jwt_1.createAccessToken)({
            userId: user.id,
            email: user.email,
            username: user.username,
        });
        const refreshToken = (0, jwt_1.createRefreshToken)({
            userId: user.id,
            email: user.email,
            username: user.username,
        });
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Selamat datang kembali! Kamu berhasil login.', {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        }));
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Waduh, ada kendala pas mau login-in kamu.', error instanceof Error ? error.message : 'Unknown error'));
    }
};
exports.login = login;
/**
 * Ambil data user yang lagi login.
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Identitas kamu nggak ketemu nih.'));
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.NOT_FOUND, 'User-nya nggak ada di database kita.'));
        }
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Ini data profil kamu ya.', { user }));
    }
    catch (error) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data profil kamu.'));
    }
};
exports.getMe = getMe;
/**
 * Buat logout. Karena pake JWT, biasanya frontend tinggal hapus token di storage aja.
 * Tapi kita kasih response success aja buat formalitas.
 */
const logout = async (req, res) => {
    return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Sampai jumpa lagi! Kamu berhasil logout.'));
};
exports.logout = logout;
