import { Router } from 'express';
import * as playlistController from '../controllers/playlist.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', playlistController.getMyPlaylists);
router.post('/', playlistController.createPlaylist);
router.get('/:id', playlistController.getPlaylistDetail);
router.post('/:id/add-song', playlistController.addSongToPlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.delete('/:id/remove-song/:musicId', playlistController.removeSongFromPlaylist);

export default router;
