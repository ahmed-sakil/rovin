import { Router } from 'express';
import {
  sendRegisterOtp,
  verifyAndRegister,
  login,
  sendForgotPasswordOtp,
  resetPassword,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import {
  getAddresses,
  addAddress,
  deleteAddress,
} from '../controllers/addressController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

// Public OTP & Registration
router.post('/register-otp', otpLimiter, sendRegisterOtp);
router.post('/register', authLimiter, verifyAndRegister);
router.post('/login', authLimiter, login);

// Password Recovery
router.post('/forgot-password-otp', otpLimiter, sendForgotPasswordOtp);
router.post('/reset-password', authLimiter, resetPassword);

// Authenticated Routes
router.get('/me', authenticateUser, getMe);
router.post('/change-password', authenticateUser, changePassword);

// Saved Addresses
router.get('/addresses', authenticateUser, getAddresses);
router.post('/addresses', authenticateUser, addAddress);
router.delete('/addresses/:id', authenticateUser, deleteAddress);

export default router;
