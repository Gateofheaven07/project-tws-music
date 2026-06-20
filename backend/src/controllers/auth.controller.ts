import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { createAccessToken, createRefreshToken } from '../lib/auth/jwt';
import { normalizeAvatar } from '../lib/avatar';
import { HTTP_STATUS } from '../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_STATE_COOKIE = 'google_oauth_state';

interface GoogleProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
}

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

const readCookie = (req: Request, name: string) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return target ? decodeURIComponent(target.split('=').slice(1).join('=')) : null;
};

const clearGoogleStateCookie = (res: Response) => {
  res.cookie(GOOGLE_STATE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
};

const createTokenResponse = (user: { id: string; email: string; username: string; avatar: string | null; role: string }) => {
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: normalizeAvatar(user.avatar),
      role: user.role,
    },
    tokens: {
      accessToken: createAccessToken(tokenPayload),
      refreshToken: createRefreshToken(tokenPayload),
    },
  };
};

const makeUsernameSeed = (profile: GoogleProfile) => {
  const source = profile.name || profile.email.split('@')[0] || 'user';
  const seed = source.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);

  return seed || 'user';
};

const createUniqueUsername = async (profile: GoogleProfile) => {
  const seed = makeUsernameSeed(profile);
  let username = seed;
  let suffix = 0;

  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${seed}${suffix}`;
  }

  return username;
};

/**
 * Controller buat nanganin pendaftaran user baru.
 * Kita bakal ngecek dulu apa email/username udah kepake atau belum.
 */

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validasi input sederhana, nanti bisa ditambah Zod kalau mau lebih ketat
    if (!email || !username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Email, username, sama password wajib diisi ya.')
      );
    }

    // Cek dulu apa user udah terdaftar
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json(
        createErrorResponse(HTTP_STATUS.CONFLICT, 'Wah, email atau username ini udah ada yang punya.')
      );
    }

    // Amankan password sebelum disimpen
    const hashedPassword = await hashPassword(password);

    // Bikin user baru di database
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Kita hapus bagian pembuatan token otomatis di sini. 
    // Jadi user harus login manual setelah akunnya berhasil dibuat.

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Yeay! Akun kamu berhasil dibuat. Silakan login ya.', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: normalizeAvatar(user.avatar),
        }
      })
    );
  } catch (error) {
    console.error('Register error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Aduh, server lagi pusing nih pas mau daftarin kamu.',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
};

/**
 * Mulai proses daftar atau masuk memakai Google.
 * State disimpan di cookie supaya callback yang masuk nanti bisa divalidasi.
 */
export const googleAuth = async (req: Request, res: Response) => {
  const config = getGoogleConfig();

  if (!config) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Konfigurasi login Google belum lengkap. Cek env backend dulu ya.'
      )
    );
  }

  const state = crypto.randomBytes(24).toString('hex');
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

/**
 * Callback dari Google. Setelah profil valid, backend membuat token aplikasi
 * lalu mengembalikan user ke frontend lewat URL fragment.
 */
export const googleCallback = async (req: Request, res: Response) => {
  const config = getGoogleConfig();

  if (!config) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Konfigurasi login Google belum lengkap. Cek env backend dulu ya.'
      )
    );
  }

  const code = typeof req.query.code === 'string' ? req.query.code : null;
  const state = typeof req.query.state === 'string' ? req.query.state : null;
  const savedState = readCookie(req, GOOGLE_STATE_COOKIE);

  clearGoogleStateCookie(res);

  if (!code || !state || !savedState || state !== savedState) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      createErrorResponse(
        HTTP_STATUS.UNAUTHORIZED,
        'Sesi daftar Google sudah tidak valid. Silakan coba lagi dari awal.'
      )
    );
  }

  try {
    const tokenResponse = await axios.post(
      GOOGLE_TOKEN_URL,
      new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data?.access_token;

    if (!accessToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(
          HTTP_STATUS.UNAUTHORIZED,
          'Google belum mengirim token yang valid. Silakan coba lagi.'
        )
      );
    }

    const profileResponse = await axios.get<GoogleProfile>(GOOGLE_PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = profileResponse.data;

    if (!profile?.id || !profile.email) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(
          HTTP_STATUS.UNAUTHORIZED,
          'Profil Google belum lengkap untuk membuat akun.'
        )
      );
    }

    const userByGoogleId = await prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    const userByEmail = userByGoogleId
      ? null
      : await prisma.user.findUnique({
          where: { email: profile.email },
        });

    const user = userByGoogleId
      ? userByGoogleId
      : userByEmail
        ? await prisma.user.update({
            where: { id: userByEmail.id },
            data: {
              googleId: profile.id,
              authProvider: 'google',
              avatar: userByEmail.avatar || profile.picture || null,
            },
          })
        : await prisma.user.create({
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
  } catch (error) {
    console.error('Google callback error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Akun Google belum berhasil diproses. Silakan coba lagi.',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Email sama password jangan sampe kosong ya.')
      );
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Email atau password kamu salah, coba cek lagi deh.')
      );
    }

    if (!user.password) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(
          HTTP_STATUS.UNAUTHORIZED,
          'Akun ini terdaftar lewat Google. Silakan masuk memakai tombol Google.'
        )
      );
    }

    // Cek passwordnya cocok apa nggak
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Email atau password kamu salah, coba cek lagi deh.')
      );
    }

    // Kalo cocok, kasih token buat akses API
    const accessToken = createAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const refreshToken = createRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Selamat datang kembali! Kamu berhasil login.', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: normalizeAvatar(user.avatar),
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Waduh, ada kendala pas mau login-in kamu.',
        error instanceof Error ? error.message : 'Unknown error'
      )
    );
  }
};

/**
 * Ambil data user yang lagi login.
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse(HTTP_STATUS.UNAUTHORIZED, 'Identitas kamu nggak ketemu nih.')
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User-nya nggak ada di database kita.')
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Ini data profil kamu ya.', {
        user: {
          ...user,
          avatar: normalizeAvatar(user.avatar),
          role: user.role,
        },
      })
    );
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil data profil kamu.')
    );
  }
};

/**
 * Buat logout. Karena pake JWT, biasanya frontend tinggal hapus token di storage aja.
 * Tapi kita kasih response success aja buat formalitas.
 */
export const logout = async (req: Request, res: Response) => {
  return res.status(HTTP_STATUS.OK).json(
    createSuccessResponse(HTTP_STATUS.OK, 'Sampai jumpa lagi! Kamu berhasil logout.')
  );
};
