import { Router } from 'express';
import * as historyController from '../controllers/history.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', historyController.getHistory);
router.post('/', historyController.addToHistory);

export default router;
