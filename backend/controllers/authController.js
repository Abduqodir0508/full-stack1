const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/sendEmail');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// In-memory mock users list for offline zero-downtime development
const mockUsers = [
  {
    _id: 'admin-001',
    name: 'Tizim Administratori',
    email: 'admin@ministore.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
  },
  {
    _id: 'user-001',
    name: 'Demo Xaridor',
    email: 'user@ministore.com',
    password: 'user123',
    role: 'user',
    isVerified: true,
  },
];

// Helper to generate JWT including user's real name and email
const generateToken = (id, role, name, email) => {
  return jwt.sign(
    { id, role, name, email },
    process.env.JWT_SECRET || 'ministore_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Yangi foydalanuvchini ro'yxatdan o'tkazish
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Iltimos, barcha maydonlarni to\'ldiring: ism, email va parol');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Parol kamida 6 ta belgidan iborat bo\'lishi shart');
    }

    const trimmedName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Agar MongoDB ulangan bo'lsa
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return errorResponse(res, 400, 'Bu email manziliga ega foydalanuvchi allaqachon mavjud');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: trimmedName,
        email: cleanEmail,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpires,
        role: 'user',
      });

      const emailResult = await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationToken,
      });

      return successResponse(
        res,
        201,
        'Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Iltimos, hisobingizni tasdiqlang.',
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationToken,
          previewUrl: emailResult.previewUrl || undefined,
        }
      );
    }

    // In-memory fallback
    const existing = mockUsers.find((u) => u.email === cleanEmail);
    if (existing) {
      return errorResponse(res, 400, 'Bu email manziliga ega foydalanuvchi allaqachon mavjud');
    }

    const newUser = {
      _id: 'user-' + Date.now(),
      name: trimmedName,
      email: cleanEmail,
      password,
      role: 'user',
      isVerified: true,
      verificationToken,
      verificationTokenExpires,
    };
    mockUsers.push(newUser);

    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      name: trimmedName,
      verificationToken,
    });

    return successResponse(
      res,
      201,
      'Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Hisobingiz faollashtirildi.',
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: true,
        verificationToken,
        previewUrl: emailResult.previewUrl || undefined,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Email manzilini tasdiqlash
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const requestedName = req.query.name;

    if (!token) {
      return errorResponse(res, 400, 'Tasdiqlash tokeni kiritilmadi');
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        return errorResponse(res, 400, 'Tasdiqlash tokeni yaroqsiz yoki muddati o\'tgan');
      }

      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      await user.save();

      const jwtToken = generateToken(user._id, user.role, user.name, user.email);

      return successResponse(res, 200, 'Email muvaffaqiyatli tasdiqlandi! Hisobingiz faol.', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token: jwtToken,
      });
    }

    // In-memory fallback
    const userInMem = mockUsers.find((u) => u.verificationToken === token);
    const userId = userInMem ? userInMem._id : 'user-' + Date.now();
    const userName = (userInMem && userInMem.name) ? userInMem.name : (requestedName ? decodeURIComponent(requestedName).trim() : 'Mijoz');
    const userEmail = (userInMem && userInMem.email) ? userInMem.email : 'user@ministore.com';
    const userRole = (userInMem && userInMem.role) ? userInMem.role : 'user';

    if (userInMem) {
      userInMem.isVerified = true;
      if (requestedName) userInMem.name = userName;
    }

    const jwtToken = generateToken(userId, userRole, userName, userEmail);

    return successResponse(res, 200, 'Email muvaffaqiyatli tasdiqlandi! Hisobingiz faol.', {
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        isVerified: true,
      },
      token: jwtToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Tizimga kirish (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Iltimos, email va parolni kiriting');
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Agar real MongoDB ulangan bo'lsa
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return errorResponse(res, 401, 'Email yoki parol noto\'g\'ri kiritildi');
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return errorResponse(res, 401, 'Email yoki parol noto\'g\'ri kiritildi');
      }

      if (!user.isVerified) {
        return errorResponse(
          res,
          403,
          'Email manzilingiz tasdiqlanmagan. Iltimos, pochtangizni tekshiring yoki havola orqali tasdiqlang.',
          { requiresVerification: true, email: user.email, verificationToken: user.verificationToken }
        );
      }

      const token = generateToken(user._id, user.role, user.name, user.email);

      return successResponse(res, 200, 'Tizimga muvaffaqiyatli kirdingiz', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      });
    }

    // 2. In-memory fallback (agar MongoDB o'chiq bo'lsa)
    const user = mockUsers.find((u) => u.email === cleanEmail);

    if (!user || user.password !== password) {
      return errorResponse(
        res,
        401,
        'Email yoki parol noto\'g\'ri. Demo uchun: admin@ministore.com (parol: admin123) yoki yangi ro\'yxatdan o\'tgan ma\'lumotlaringizni kiriting.'
      );
    }

    const token = generateToken(user._id, user.role, user.name, user.email);

    return successResponse(res, 200, 'Tizimga muvaffaqiyatli kirdingiz', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Tasdiqlash xatini qayta yuborish
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Iltimos, email manzilini kiriting');
    }

    const cleanEmail = email.toLowerCase().trim();
    const verificationToken = crypto.randomBytes(32).toString('hex');

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return errorResponse(res, 404, 'Bu email manziliga ega hisob topilmadi');
      }

      if (user.isVerified) {
        return errorResponse(res, 400, 'Ushbu hisob allaqachon tasdiqlangan. Tizimga kirishingiz mumkin.');
      }

      user.verificationToken = verificationToken;
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      const emailResult = await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationToken,
      });

      return successResponse(res, 200, 'Tasdiqlash xati qayta yuborildi.', {
        verificationToken,
        previewUrl: emailResult.previewUrl || undefined,
      });
    }

    const userInMem = mockUsers.find((u) => u.email === cleanEmail);
    const inMemName = userInMem ? userInMem.name : 'Hurmatli Mijoz';

    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      name: inMemName,
      verificationToken,
    });

    return successResponse(res, 200, 'Tasdiqlash xati qayta yuborildi.', {
      verificationToken,
      previewUrl: emailResult.previewUrl || undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Joriy foydalanuvchi profilini olish
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Foydalanuvchi ma\'lumotlari olindi', { user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  resendVerification,
  getMe,
  mockUsers,
};
