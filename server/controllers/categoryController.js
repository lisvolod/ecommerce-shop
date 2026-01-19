import Category from '../models/Category.js';
import Product from '../models/Product.js';

// GET /api/categories - Отримати всі категорії
export const getCategories = async (req, res, next) => {
  try {
    // Використовуємо aggregate для підрахунку товарів у кожній категорії
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products', // назва колекції товарів
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0 // не включаємо самі товари, тільки кількість
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);
    
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
// Як працює MongoDB Aggregate:
//   $lookup - JOIN з колекцією products
//   $addFields - Додає поле productCount (розмір масиву products)
//   $project - Видаляє масив products (залишає тільки count)
//   $sort - Сортує за назвою

// Категорії повертаються з полем productCount
// [
//   {
//     "_id": "69487e3f5e97d4dd5aa010c3",
//     "name": "Процесори",
//     "description": "Процесори Intel та AMD",
//     "productCount": 5,  // ← Додано!
//     "createdAt": "2025-12-21T23:09:51.200Z",
//     "updatedAt": "2025-12-21T23:09:51.200Z"
//   },
//   {
//     "_id": "69487e3f5e97d4dd5aa010c6",
//     "name": "Блоки живлення",
//     "description": "Блоки живлення різної потужності",
//     "productCount": 4,  // ← Додано!
//     "createdAt": "2025-12-21T23:09:51.200Z",
//     "updatedAt": "2026-01-08T01:51:42.748Z"
//   }
// ]


// GET /api/categories/:id - Отримати категорію за ID
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }
    
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// POST /api/categories - Створити категорію (Admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/categories/:id - Оновити категорію (Admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }
    
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id - Видалити категорію (Admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    
    // Перевірити чи є товари в цій категорії
    const productsCount = await Product.countDocuments({ category: categoryId });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Неможливо видалити категорію з товарами',
        productsCount,
        message: 'Спочатку перемістіть товари в іншу категорію'
      });
    }
    
    const category = await Category.findByIdAndDelete(categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }
    
    res.json({ message: 'Категорію успішно видалено', category });
  } catch (error) {
    next(error);
  }
};
