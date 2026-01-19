import Product from '../models/Product.js';

// GET /api/products - Отримати товари з фільтрацією, пошуком, сортуванням та пагінацією
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      hasDiscount,
      sort = '-createdAt'
    } = req.query;

    // Побудова фільтру
    const filter = {};

    // Фільтр по категорії
    if (category) {
      filter.category = category;
    }

    // Пошук по назві та опису
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Фільтр по ціні
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Фільтр по наявності
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Фільтр по знижкам
    if (hasDiscount === 'true') {
      filter.discount = { $gt: 0 };
    }

    // Сортування
    let sortOption = {};
    switch (sort) {
      case 'price':
        sortOption = { price: 1 };
        break;
      case '-price':
        sortOption = { price: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      case '-name':
        sortOption = { name: -1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: 1 };
        break;
      case '-createdAt':
      default:
        sortOption = { createdAt: -1 };
    }

    // Пагінація
    const skip = (page - 1) * limit;

    // Запит
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip);

    // Загальна кількість
    const total = await Product.countDocuments(filter);
    
    const hasMore = skip + products.length < total;

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id - Отримати товар за ID
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не знайдено' });
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// POST /api/products - Створити товар (Admin)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discount, stock, image, images, category } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      discount: discount || 0,
      stock: stock || 0,
      image,
      images: images || [],
      category
    });
    
    await product.populate('category', 'name');
    
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/products/:id - Оновити товар (Admin)
export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, discount, stock, image, images, category } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, discount, stock, image, images, category },
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не знайдено' });
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id - Видалити товар (Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не знайдено' });
    }
    
    res.json({ message: 'Товар успішно видалено', product });
  } catch (error) {
    next(error);
  }
};
