const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ministore_super_secret_jwt_key_2026');

      if (mongoose.connection.readyState === 1) {
        // Fetch user from DB and omit password
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      }

      // Check in-memory mock users list
      const { mockUsers } = require('../controllers/authController');
      const inMem = mockUsers.find((u) => u._id === decoded.id || u.email === decoded.email);
      if (inMem) {
        req.user = {
          _id: inMem._id,
          name: inMem.name,
          email: inMem.email,
          role: inMem.role,
          isVerified: true,
        };
        return next();
      }

      // Fallback: use decoded values stored directly inside the JWT token
      req.user = {
        _id: decoded.id,
        name: decoded.name || (decoded.role === 'admin' ? 'Tizim Administratori' : 'Xaridor'),
        email: decoded.email || (decoded.role === 'admin' ? 'admin@ministore.com' : 'user@ministore.com'),
        role: decoded.role || 'user',
        isVerified: true,
      };
      return next();
    } catch (error) {
      return errorResponse(res, 401, 'Avtorizatsiyadan o\'tilmagan, token yaroqsiz', error.message);
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Avtorizatsiya tokeni topilmadi');
  }
};

module.exports = {
  verifyToken,
};
