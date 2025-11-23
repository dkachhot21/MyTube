import express from 'express';
import { register, login, getCurrentUser, logout, getSessions } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);
router.get('/sessions', authMiddleware, getSessions);

export default router;
