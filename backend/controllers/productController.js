const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { mockCategories } = require('./categoryController');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Namuna mahsulotlar (O'zbek tilida)
let mockProducts = [
  {
    _id: '672728901234567890prod01',
    title: 'Aura Sim-siz Shovqinni Bosuvchi Quloqchinlar',
    description: 'Kristaldek tiniq fazoviy audio, faol shovqinni pasaytirish (ANC), 40 soatlik batareya quvvati va yumshoq xotirali quloq yostiqchalari.',
    price: 199.99,
    category: mockCategories[0],
    stock: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '672728901234567890prod02',
    title: 'Minimalist Mexanik Klaviatura (RGB)',
    description: 'Hot-swappable taktil tugmalar, aviatsiya darajasidagi alyuminiy korpus va dasturlanadigan RGB chiroqlari.',
    price: 129.50,
    category: mockCategories[3],
    stock: 18,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '672728901234567890prod03',
    title: 'Artisan Keramik Qahva Qaynatgich va Chini To\'plami',
    description: 'Qora mot qoplamali qo\'lda ishlangan keramik idish, qahvani aniq va maromida damlash uchun maxsus ingichka jo\'mrak.',
    price: 64.00,
    category: mockCategories[2],
    stock: 40,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '672728901234567890prod04',
    title: 'Tabiiy Charmdan Tayyorlangan Zamonaviy Ryukzak',
    description: 'Italiya tabiiy charmi, suv o\'tkazmaydigan qoplama va 16 dyuymli noutbuk uchun himoyalangan maxsus bo\'lma.',
    price: 159.00,
    category: mockCategories[1],
    stock: 12,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '672728901234567890prod05',
    title: 'Ultra-Keng 4K Egri Monitor (Ish va O\'yin uchun)',
    description: '34 dyuymli egri ekran, 144Hz yangilanish tezligi, HDR400 va professional ranglar aniqligi (99% sRGB).',
    price: 499.00,
    category: mockCategories[0],
    stock: 8,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '672728901234567890prod06',
    title: '100% Organik Paxtadan Qulay Xudi (Oversize)',
    description: 'GOTS sertifikatiga ega paxta, yuqori sifatli ichki issiq mato va kundalik kiyish uchun qulay bichim.',
    price: 75.00,
    category: mockCategories[1],
    stock: 30,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '672728901234567890prod07',
    title: 'Titan Aqlli Fitnes va Salomatlik Soati',
    description: 'Yurak urishi, SpO2 va uyqu monitoringi, AMOLED sapfir sensorli ekran, 14 kunlik batareya quvvati.',
    price: 249.99,
    category: mockCategories[3],
    stock: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '672728901234567890prod08',
    title: 'Smart Ambient Quyosh Botishi Chirog\'i va Dinamik',
    description: 'Ilova orqali boshqariladigan quyosh botishi ranglari va 360° stereo Bluetooth dinamik tizimi.',
    price: 48.00,
    category: mockCategories[2],
    stock: 50,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    createdAt: new Date().toISOString(),
  },
];

/**
 * @desc    Barcha mahsulotlarni qidiruv, saralash va sahifalash bilan olish
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      sort,
      page = 1,
      limit = 8,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 8));

    // Agar real MongoDB ulangan bo'lsa
    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ];
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price_asc') {
        sortOptions = { price: 1 };
      } else if (sort === 'price_desc') {
        sortOptions = { price: -1 };
      } else if (sort === 'newest') {
        sortOptions = { createdAt: -1 };
      }

      const skip = (pageNumber - 1) * limitNumber;
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limitNumber) || 1;

      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber);

      return res.status(200).json({
        success: true,
        message: 'Mahsulotlar muvaffaqiyatli olindi',
        data: {
          products,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalProducts,
            limit: limitNumber,
            hasNextPage: pageNumber < totalPages,
            hasPrevPage: pageNumber > 1,
          },
        },
      });
    }

    // In-memory fallback
    let filtered = [...mockProducts];

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s))
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(
        (p) => (p.category?._id || p.category) === category
      );
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalProducts = filtered.length;
    const totalPages = Math.ceil(totalProducts / limitNumber) || 1;
    const skip = (pageNumber - 1) * limitNumber;
    const paginated = filtered.slice(skip, skip + limitNumber);

    return res.status(200).json({
      success: true,
      message: 'Mahsulotlar muvaffaqiyatli olindi',
      data: {
        products: paginated,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    ID bo'yicha bitta mahsulotni olish
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id).populate('category', 'name slug');
      if (!product) {
        return errorResponse(res, 404, 'Mahsulot topilmadi');
      }
      return successResponse(res, 200, 'Mahsulot ma\'lumotlari olindi', product);
    }

    const product = mockProducts.find((p) => p._id === req.params.id);
    if (!product) {
      return errorResponse(res, 404, 'Mahsulot topilmadi');
    }
    return successResponse(res, 200, 'Mahsulot ma\'lumotlari olindi', product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Yangi mahsulot yaratish
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, stock } = req.body;

    if (!title || !price || !category) {
      return errorResponse(res, 400, 'Iltimos, sarlavha, narx va kategoriyani kiriting');
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        price: Number(price),
        category,
        stock: Number(stock) || 0,
        image: imagePath,
      });

      const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
      return successResponse(res, 201, 'Mahsulot muvaffaqiyatli yaratildi', populatedProduct);
    }

    const matchedCategory = mockCategories.find((c) => c._id === category) || { _id: category, name: 'Umumiy' };
    const newProduct = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      category: matchedCategory,
      stock: Number(stock) || 0,
      image: imagePath || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      createdAt: new Date().toISOString(),
    };
    mockProducts.unshift(newProduct);
    return successResponse(res, 201, 'Mahsulot muvaffaqiyatli yaratildi', newProduct);
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

/**
 * @desc    Mahsulotni tahrirlash
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return errorResponse(res, 404, 'Mahsulot topilmadi');
      }

      const { title, description, price, category, stock } = req.body;
      if (title) product.title = title.trim();
      if (description !== undefined) product.description = description.trim();
      if (price !== undefined) product.price = Number(price);
      if (category) product.category = category;
      if (stock !== undefined) product.stock = Number(stock);

      if (req.file) {
        if (product.image && product.image.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, '..', product.image);
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            } catch (e) {
              console.warn('Eski rasm o\'chirilmadi:', e.message);
            }
          }
        }
        product.image = `/uploads/${req.file.filename}`;
      } else if (req.body.image) {
        product.image = req.body.image;
      }

      await product.save();
      const updated = await Product.findById(product._id).populate('category', 'name slug');
      return successResponse(res, 200, 'Mahsulot muvaffaqiyatli yangilandi', updated);
    }

    const prod = mockProducts.find((p) => p._id === req.params.id);
    if (!prod) {
      return errorResponse(res, 404, 'Mahsulot topilmadi');
    }

    const { title, description, price, category, stock } = req.body;
    if (title) prod.title = title.trim();
    if (description !== undefined) prod.description = description.trim();
    if (price !== undefined) prod.price = Number(price);
    if (category) {
      prod.category = mockCategories.find((c) => c._id === category) || { _id: category, name: 'Umumiy' };
    }
    if (stock !== undefined) prod.stock = Number(stock);
    if (req.file) {
      prod.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      prod.image = req.body.image;
    }

    return successResponse(res, 200, 'Mahsulot muvaffaqiyatli yangilandi', prod);
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

/**
 * @desc    Mahsulotni o'chirish
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return errorResponse(res, 404, 'Mahsulot topilmadi');
      }

      if (product.image && product.image.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (e) {
            console.warn('Rasm fayli o\'chirilmadi:', e.message);
          }
        }
      }

      await product.deleteOne();
      return successResponse(res, 200, 'Mahsulot muvaffaqiyatli o\'chirildi', { id: req.params.id });
    }

    const idx = mockProducts.findIndex((p) => p._id === req.params.id);
    if (idx !== -1) {
      mockProducts.splice(idx, 1);
    }
    return successResponse(res, 200, 'Mahsulot muvaffaqiyatli o\'chirildi', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
