import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:musicId', favoriteController.removeFavorite);

export default router;
