import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Route buat daftar dan login (nggak butuh auth)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route yang butuh login
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

export default router;
