import express from 'express';
import {
    savePlaybackPosition,
    getPlaybackPosition,
    getPlaybackHistory,
    getContinueWatching,
    deletePlaybackHistory,
    clearAllHistory
} from '../controllers/playbackController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All playback routes require authentication
router.post('/save', authMiddleware, savePlaybackPosition);
router.get('/history', authMiddleware, getPlaybackHistory);
router.get('/continue', authMiddleware, getContinueWatching);
router.delete('/clear-all', authMiddleware, clearAllHistory);
router.get('/:mediaId', authMiddleware, getPlaybackPosition);
router.delete('/:mediaId', authMiddleware, deletePlaybackHistory);

export default router;
