import express from 'express';
import { login, register, logout, resetPassword, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter, passwordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiting 적용
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/reset-password', passwordLimiter, resetPassword); // 비밀번호 재설정 (학원 코드로)
router.post('/change-password', authenticate, passwordLimiter, changePassword); // 비밀번호 변경 (로그인된 사용자용)

export default router;

