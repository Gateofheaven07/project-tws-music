import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware, superAdminMiddleware } from '../middlewares/admin.middleware';

// Admin Controllers
import * as dashboardController from '../controllers/admin/dashboard.controller';
import * as userManagementController from '../controllers/admin/user-management.controller';
import * as reviewModerationController from '../controllers/admin/review-moderation.controller';
import * as analyticsController from '../controllers/admin/analytics.controller';
import * as systemController from '../controllers/admin/system.controller';

const router = Router();

// Semua route admin wajib login + minimal role ADMIN
router.use(authMiddleware);
router.use(adminMiddleware);

// ─── Dashboard ───────────────────────────────────────
// Akses: ADMIN & SUPER_ADMIN
router.get('/dashboard/stats', dashboardController.getStats);
router.get('/dashboard/charts', dashboardController.getCharts);

// ─── Review Moderation ──────────────────────────────
// Akses: ADMIN & SUPER_ADMIN
router.get('/reviews', reviewModerationController.getAllReviews);
router.patch('/reviews/:id/reply', reviewModerationController.replyReview);
router.delete('/reviews/:id', reviewModerationController.deleteReview);

// ─── Analytics ──────────────────────────────────────
// Akses: ADMIN & SUPER_ADMIN
router.get('/analytics/registrations', analyticsController.getRegistrationTrend);
router.get('/analytics/top-songs', analyticsController.getTopSongs);
router.get('/analytics/top-artists', analyticsController.getTopArtists);
router.get('/analytics/genres', analyticsController.getGenreDistribution);

// ─── User Management (ADMIN & SUPER_ADMIN) ─────────────
// ADMIN bisa kelola USER. SUPER_ADMIN bisa kelola ADMIN & USER.
router.get('/users', adminMiddleware, userManagementController.getUsers);
router.get('/users/:id', adminMiddleware, userManagementController.getUserDetail);
router.post('/users', adminMiddleware, userManagementController.createUser);
router.patch('/users/:id', adminMiddleware, userManagementController.updateUser);
router.patch('/users/:id/role', superAdminMiddleware, userManagementController.updateUserRole);
router.delete('/users/:id', adminMiddleware, userManagementController.deleteUser);

// ─── System Health (SUPER_ADMIN only) ───────────────
router.get('/system/health', superAdminMiddleware, systemController.getSystemHealth);

export default router;
