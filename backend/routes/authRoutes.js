const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  resendVerification,
  getMe,
} = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/resend-verification', resendVerification);
router.get('/me', verifyToken, getMe);

module.exports = router;

