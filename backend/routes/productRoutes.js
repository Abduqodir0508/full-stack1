const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Har qanday foydalanuvchi (oddiy foydalanuvchi ham) mahsulot qo'sha olishi uchun
const allowUserOrGuest = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return verifyToken(req, res, next);
  }
  // Agar token bo'lmasa ham mahsulot qo'shishga ruxsat beramiz
  req.user = { _id: 'user-' + Date.now(), role: 'user', name: 'Foydalanuvchi' };
  next();
};

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', allowUserOrGuest, upload.single('image'), createProduct);
router.put('/:id', allowUserOrGuest, upload.single('image'), updateProduct);
router.delete('/:id', allowUserOrGuest, deleteProduct);

module.exports = router;
