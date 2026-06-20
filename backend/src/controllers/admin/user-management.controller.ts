import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { HTTP_STATUS } from '../../utils/constants';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { hashPassword } from '../../lib/auth/password';

/**
 * Ambil daftar user. 
 * Akses: 
 * - SUPER_ADMIN bisa lihat semua.
 * - ADMIN hanya bisa lihat USER.
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string) || '';
    const roleParam = req.query.role as string | undefined;
    const provider = req.query.provider as string | undefined;
    
    const currentUserRole = (req as any).user.role;

    // Bangun filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filtering berdasarkan hak akses
    if (currentUserRole === 'ADMIN') {
      where.role = 'USER'; // ADMIN hanya bisa list USER
    } else {
      if (roleParam && ['USER', 'ADMIN', 'SUPER_ADMIN'].includes(roleParam)) {
        where.role = roleParam;
      }
    }

    if (provider && ['local', 'google'].includes(provider)) {
      where.authProvider = provider;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          authProvider: true,
          createdAt: true,
          _count: {
            select: {
              playlists: true,
              likedSongs: true,
              playHistory: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Daftar user berhasil diambil.', users, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil daftar user.')
    );
  }
};

/**
 * Ambil detail satu user beserta statistiknya.
 */
export const getUserDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const currentUserRole = (req as any).user.role;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        authProvider: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            playlists: true,
            likedSongs: true,
            playHistory: true,
          },
        },
        appReview: {
          select: {
            id: true,
            rating: true,
            review: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.')
      );
    }

    // Proteksi: Admin cuma bisa lihat detail USER
    if (currentUserRole === 'ADMIN' && user.role !== 'USER') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Admin hanya bisa melihat detail akun User biasa.')
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, 'Detail user berhasil diambil.', user)
    );
  } catch (error) {
    console.error('getUserDetail error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal ngambil detail user.')
    );
  }
};

/**
 * Membuat User/Admin baru dari dashboard
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const currentUserRole = (req as any).user.role;
    const { email, username, password, role } = req.body;

    if (!email || !username || !password || !role) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Semua field (email, username, password, role) wajib diisi.')
      );
    }

    if (currentUserRole === 'ADMIN' && role !== 'USER') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Admin hanya bisa membuat akun dengan role USER.')
      );
    }

    if (currentUserRole === 'SUPER_ADMIN' && !['USER', 'ADMIN'].includes(role)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Super Admin hanya bisa membuat role USER atau ADMIN.')
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Email atau username sudah terdaftar.')
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json(
      createSuccessResponse(HTTP_STATUS.CREATED, 'Akun berhasil dibuat.', newUser)
    );
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal membuat akun.')
    );
  }
};

/**
 * Mengedit profil user (email, username, password). Tidak mengedit role.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const currentUserRole = (req as any).user.role;
    const currentUserId = (req as any).user.userId;
    const { email, username, password } = req.body;

    if (id === currentUserId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Anda tidak bisa mengedit akun sendiri dari sini (Gunakan halaman Profil Anda).')
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.')
      );
    }

    if (currentUserRole === 'ADMIN' && targetUser.role !== 'USER') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Admin hanya bisa mengedit akun User biasa.')
      );
    }

    if (currentUserRole === 'SUPER_ADMIN' && targetUser.role === 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Super Admin tidak bisa saling mengedit akun Super Admin lain dari sini.')
      );
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (password) updateData.password = await hashPassword(password);

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, `Akun ${updated.username} berhasil di-update.`, updated)
    );
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal update user.')
    );
  }
};

/**
 * Mengubah role user.
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const currentUserId = (req as any).user.userId;
    const currentUserRole = (req as any).user.role;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Role tidak valid.')
      );
    }

    if (id === currentUserId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Kamu tidak bisa mengubah role akunmu sendiri dari sini.')
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.')
      );
    }

    if (currentUserRole === 'ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Admin tidak bisa mengubah role user.')
      );
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Role Super Admin tidak bisa diubah.')
      );
    }

    if (role === 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Tidak bisa menaikkan role ke Super Admin dari dashboard.')
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, `Role ${updated.username} berhasil diubah menjadi ${updated.role}.`, updated)
    );
  } catch (error) {
    console.error('updateUserRole error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal mengubah role user.')
    );
  }
};

/**
 * Hapus user beserta semua datanya (hard-delete, cascade).
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const currentUserId = (req as any).user.userId;
    const currentUserRole = (req as any).user.role;

    if (id === currentUserId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Kamu nggak bisa hapus akun sendiri dari sini.')
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, username: true },
    });

    if (!targetUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        createErrorResponse(HTTP_STATUS.NOT_FOUND, 'User tidak ditemukan.')
      );
    }

    if (currentUserRole === 'ADMIN' && targetUser.role !== 'USER') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Admin hanya bisa menghapus akun User biasa.')
      );
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(HTTP_STATUS.FORBIDDEN, 'Super Admin tidak bisa dihapus dari dashboard.')
      );
    }

    await prisma.user.delete({ where: { id } });

    return res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(HTTP_STATUS.OK, `User ${targetUser.username} berhasil dihapus.`)
    );
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Gagal menghapus user.')
    );
  }
};
