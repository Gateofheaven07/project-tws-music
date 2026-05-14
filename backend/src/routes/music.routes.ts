import { Router } from 'express';
import * as musicController from '../controllers/music.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Route publik (bisa diakses tanpa login)
router.get('/search', musicController.search);
router.get('/trending', musicController.trending);

// Route musik lainnya butuh login biar aman
router.use(authMiddleware);

router.get('/stream-id', musicController.getStreamId);
router.get('/artist/:id', musicController.getArtist);
router.get('/album/:id', musicController.getAlbum);

export default router;
