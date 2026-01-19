import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// GET /api/wishlist - Отримати wishlist користувача
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'items',
      populate: { path: 'category', select: 'name' }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/items - Додати товар в wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'ID товару обов\'язковий' });
    }

    // Перевірити чи існує товар
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Товар не знайдено' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        items: [productId]
      });
    } else {
      // Перевірити чи товар вже є
      if (wishlist.hasItem(productId)) {
        return res.status(400).json({ error: 'Товар вже в списку бажань' });
      }
      await wishlist.addItem(productId);
    }

    await wishlist.save();

    // Populate для відповіді
    await wishlist.populate({
      path: 'items',
      populate: { path: 'category', select: 'name' }
    });

    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wishlist/items/:productId - Видалити товар з wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ error: 'Список бажань не знайдено' });
    }

    await wishlist.removeItem(productId);

    await wishlist.populate({
      path: 'items',
      populate: { path: 'category', select: 'name' }
    });

    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// POST /api/wishlist/toggle - Toggle товар (додати/видалити)
export const toggleWishlistItem = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'ID товару обов\'язковий' });
    }

    // Перевірити чи існує товар
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Товар не знайдено' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Створити новий wishlist з товаром
      wishlist = await Wishlist.create({
        user: req.user._id,
        items: [productId]
      });
    } else {
      // Toggle: якщо є - видалити, якщо немає - додати
      if (wishlist.hasItem(productId)) {
        await wishlist.removeItem(productId);
      } else {
        await wishlist.addItem(productId);
      }
    }

    await wishlist.populate({
      path: 'items',
      populate: { path: 'category', select: 'name' }
    });

    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wishlist - Очистити wishlist
export const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ error: 'Список бажань не знайдено' });
    }

    await wishlist.clearWishlist();
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};