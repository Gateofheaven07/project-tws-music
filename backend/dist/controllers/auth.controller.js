"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.googleCallback = exports.googleAuth = exports.register = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const password_1 = require("../lib/auth/password");
const jwt_1 = require("../lib/auth/jwt");
const avatar_1 = require("../lib/avatar");
const constants_1 = require("../utils/constants");
const response_1 = require("../utils/response");
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_STATE_COOKIE = 'google_oauth_state';
const getGoogleConfig = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    const clientUrl = process.env.CLIENT_URL;
    if (!clientId || !clientSecret || !callbackUrl || !clientUrl) {
        return null;
    }
    return { clientId, clientSecret, callbackUrl, clientUrl };
};
const readCookie = (req, name) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader)
        return null;
    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    return target ? decodeURIComponent(target.split('=').slice(1).join('=')) : null;
};
const clearGoogleStateCookie = (res) => {
    res.cookie(GOOGLE_STATE_COOKIE, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
    });
};
const createTokenResponse = (user) => {
    const tokenPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
    };
    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: (0, avatar_1.normalizeAvatar)(user.avatar),
        },
        tokens: {
            accessToken: (0, jwt_1.createAccessToken)(tokenPayload),
            refreshToken: (0, jwt_1.createRefreshToken)(tokenPayload),
        },
    };
};
const makeUsernameSeed = (profile) => {
    const source = profile.name || profile.email.split('@')[0] || 'user';
    const seed = source.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
    return seed || 'user';
};
const createUniqueUsername = async (profile) => {
    const seed = makeUsernameSeed(profile);
    let username = seed;
    let suffix = 0;
    while (await prisma_1.prisma.user.findUnique({ where: { username } })) {
        suffix += 1;
        username = `${seed}${suffix}`;
    }
    return username;
};
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
                avatar: (0, avatar_1.normalizeAvatar)(user.avatar),
            }
        }));
    }
    catch (error) {
        console.error('Register error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Aduh, server lagi pusing nih pas mau daftarin kamu.', error instanceof Error ? error.message : 'Unknown error'));
    }
};
exports.register = register;
/**
 * Mulai proses daftar atau masuk memakai Google.
 * State disimpan di cookie supaya callback yang masuk nanti bisa divalidasi.
 */
const googleAuth = async (req, res) => {
    const config = getGoogleConfig();
    if (!config) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Konfigurasi login Google belum lengkap. Cek env backend dulu ya.'));
    }
    const state = crypto_1.default.randomBytes(24).toString('hex');
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
    });
    res.cookie(GOOGLE_STATE_COOKIE, state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000,
    });
    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};
exports.googleAuth = googleAuth;
/**
 * Callback dari Google. Setelah profil valid, backend membuat token aplikasi
 * lalu mengembalikan user ke frontend lewat URL fragment.
 */
const googleCallback = async (req, res) => {
    const config = getGoogleConfig();
    if (!config) {
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Konfigurasi login Google belum lengkap. Cek env backend dulu ya.'));
    }
    const code = typeof req.query.code === 'string' ? req.query.code : null;
    const state = typeof req.query.state === 'string' ? req.query.state : null;
    const savedState = readCookie(req, GOOGLE_STATE_COOKIE);
    clearGoogleStateCookie(res);
    if (!code || !state || !savedState || state !== savedState) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Sesi daftar Google sudah tidak valid. Silakan coba lagi dari awal.'));
    }
    try {
        const tokenResponse = await axios_1.default.post(GOOGLE_TOKEN_URL, new URLSearchParams({
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.callbackUrl,
            grant_type: 'authorization_code',
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const accessToken = tokenResponse.data?.access_token;
        if (!accessToken) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Google belum mengirim token yang valid. Silakan coba lagi.'));
        }
        const profileResponse = await axios_1.default.get(GOOGLE_PROFILE_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const profile = profileResponse.data;
        if (!profile?.id || !profile.email) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Profil Google belum lengkap untuk membuat akun.'));
        }
        const userByGoogleId = await prisma_1.prisma.user.findUnique({
            where: { googleId: profile.id },
        });
        const userByEmail = userByGoogleId
            ? null
            : await prisma_1.prisma.user.findUnique({
                where: { email: profile.email },
            });
        const user = userByGoogleId
            ? userByGoogleId
            : userByEmail
                ? await prisma_1.prisma.user.update({
                    where: { id: userByEmail.id },
                    data: {
                        googleId: profile.id,
                        authProvider: 'google',
                        avatar: userByEmail.avatar || profile.picture || null,
                    },
                })
                : await prisma_1.prisma.user.create({
                    data: {
                        email: profile.email,
                        username: await createUniqueUsername(profile),
                        password: null,
                        googleId: profile.id,
                        authProvider: 'google',
                        avatar: profile.picture || null,
                    },
                });
        const authData = createTokenResponse(user);
        const redirectUrl = new URL('/auth/google/callback', config.clientUrl);
        const fragment = new URLSearchParams({
            accessToken: authData.tokens.accessToken,
            refreshToken: authData.tokens.refreshToken,
        });
        return res.redirect(`${redirectUrl.toString()}#${fragment.toString()}`);
    }
    catch (error) {
        console.error('Google callback error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Akun Google belum berhasil diproses. Silakan coba lagi.', error instanceof Error ? error.message : 'Unknown error'));
    }
};
exports.googleCallback = googleCallback;
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
        if (!user.password) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json((0, response_1.createErrorResponse)(constants_1.HTTP_STATUS.UNAUTHORIZED, 'Akun ini terdaftar lewat Google. Silakan masuk memakai tombol Google.'));
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
                avatar: (0, avatar_1.normalizeAvatar)(user.avatar),
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
        return res.status(constants_1.HTTP_STATUS.OK).json((0, response_1.createSuccessResponse)(constants_1.HTTP_STATUS.OK, 'Ini data profil kamu ya.', {
            user: {
                ...user,
                avatar: (0, avatar_1.normalizeAvatar)(user.avatar),
            },
        }));
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
