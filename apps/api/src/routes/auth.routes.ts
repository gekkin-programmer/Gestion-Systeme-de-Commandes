import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authRateLimiter, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.post('/forgot-password', authRateLimiter, ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

// Guest OTP login (public, rate-limited)
router.post('/guest/request-otp', authRateLimiter, ctrl.requestGuestOtp);
router.post('/guest/verify-otp',  authRateLimiter, ctrl.verifyGuestOtp);

// Guest signup — phone-based rate limit handled inside the controller (per-phone, not per-IP)
router.post('/signup/request-otp', ctrl.signupRequestOtp);
router.post('/signup/verify',      ctrl.signupVerify);

export default router;
