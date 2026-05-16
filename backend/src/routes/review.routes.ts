import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', reviewController.getReviews);

router.use(authMiddleware);

router.get('/me', reviewController.getMyReview);
router.put('/me', reviewController.upsertMyReview);

export default router;
