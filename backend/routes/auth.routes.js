import express from 'express';
import { login, register, logout, resetPassword, changePassword, verifyEmail, resendVerificationEmail } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter, passwordLimiter } from '../middleware/rateLimiter.js';
import { validateLogin, validateRegister, validateChangePassword } from '../middleware/validator.js';

const router = express.Router();

// Rate limiting 및 입력 검증 적용
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail); // 이메일 인증 확인
router.post('/resend-verification', authLimiter, resendVerificationEmail); // 이메일 인증 재발송
router.post('/reset-password', passwordLimiter, resetPassword); // 비밀번호 재설정 (학원 코드로)
router.post('/change-password', authenticate, passwordLimiter, validateChangePassword, changePassword); // 비밀번호 변경 (로그인된 사용자용)

export default router;
