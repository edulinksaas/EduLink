import express from 'express';
import { login, register, logout, resetPassword, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/reset-password', resetPassword); // 비밀번호 재설정 (학원 코드로)
router.post('/change-password', authenticate, changePassword); // 비밀번호 변경 (로그인된 사용자용)

export default router;

