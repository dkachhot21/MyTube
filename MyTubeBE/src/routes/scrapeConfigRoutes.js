import express from 'express';
import * as scrapeConfigController from '../controllers/scrapeConfigController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', scrapeConfigController.getConfig);
router.post('/', scrapeConfigController.saveConfig);

export default router;
