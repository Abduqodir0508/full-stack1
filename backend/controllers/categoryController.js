const mongoose = require('mongoose');
const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const mockCategories = [
  { _id: '672728901234567890abcdef', name: 'Elektronika', slug: 'elektronika' },
  { _id: '672728901234567890abcdeg', name: 'Kiyim va Moda', slug: 'kiyim-va-moda' },
  { _id: '672728901234567890abcdeh', name: 'Uy va Oshxona', slug: 'uy-va-oshxona' },
  { _id: '672728901234567890abcdei', name: 'Gadjetlar va Aksessuarlar', slug: 'gadjetlar-va-aksessuarlar' },
  { _id: '672728901234567890abcdej', name: 'Sport va Salomatlik', slug: 'sport-va-salomatlik' },
  { _id: '672728901234567890abcdek', name: 'Go\'zallik va Parvarish', slug: 'gozallik-va-parvarish' },
  { _id: '672728901234567890abcdel', name: 'Kitoblar va Kanselyariya', slug: 'kitoblar-va-kanselyariya' },
  { _id: '672728901234567890abcdem', name: 'Avto Aksessuarlar', slug: 'avto-aksessuarlar' },
  { _id: '672728901234567890abcden', name: 'Bolalar va O\'yinchoqlar', slug: 'bolalar-va-oyinchoqlar' },
  { _id: '672728901234567890abcdeo', name: 'Parfyumeriya', slug: 'parfyumeriya' },
];

/**
 * @desc    Barcha kategoriyalarni olish
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let categories = await Category.find().sort({ name: 1 });
      // Agar bazada kategoriyalar bo'lmasa, namunaviy kategoriyalarni saqlaymiz
      if (!categories || categories.length === 0) {
        categories = await Category.insertMany(mockCategories);
      }
      return successResponse(res, 200, 'Kategoriyalar muvaffaqiyatli olindi', categories);
    }

    return successResponse(res, 200, 'Kategoriyalar olindi', mockCategories);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Yangi kategoriya yaratish
 * @route   POST /api/categories
 * @access  Public
 */
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 400, 'Kategoriya nomi kiritilishi shart');
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

    if (mongoose.connection.readyState === 1) {
      const existing = await Category.findOne({ name: trimmedName });
      if (existing) {
        return errorResponse(res, 400, 'Bunday nomli kategoriya allaqachon mavjud');
      }

      const category = await Category.create({ name: trimmedName, slug });
      return successResponse(res, 201, 'Kategoriya muvaffaqiyatli yaratildi', category);
    }

    // In-memory fallback
    const exists = mockCategories.find((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      return errorResponse(res, 400, 'Bunday nomli kategoriya allaqachon mavjud');
    }

    const newCat = {
      _id: 'cat-' + Date.now(),
      name: trimmedName,
      slug,
    };
    mockCategories.push(newCat);
    return successResponse(res, 201, 'Kategoriya muvaffaqiyatli yaratildi', newCat);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Kategoriyani o'chirish
 * @route   DELETE /api/categories/:id
 * @access  Public
 */
const deleteCategory = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return errorResponse(res, 404, 'Kategoriya topilmadi');
      }
      await category.deleteOne();
      return successResponse(res, 200, 'Kategoriya muvaffaqiyatli o\'chirildi');
    }

    const idx = mockCategories.findIndex((c) => c._id === req.params.id);
    if (idx !== -1) {
      mockCategories.splice(idx, 1);
    }
    return successResponse(res, 200, 'Kategoriya muvaffaqiyatli o\'chirildi');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  mockCategories,
};
