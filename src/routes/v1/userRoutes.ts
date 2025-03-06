import { Router } from 'express';
import { getUserProfile } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/:username', authenticateJWT, getUserProfile);

export default router; 