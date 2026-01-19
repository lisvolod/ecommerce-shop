import Cart from '../models/Cart.js';

// GET /api/cart - Отримати кошик користувача
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name' }
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/items - Додати товар в кошик
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    await cart.addItem(productId, quantity);
    await cart.populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name' }
    });

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/cart/items/:productId - Оновити кількість товару
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: 'Кошик не знайдено' });
    }

    await cart.updateItemQuantity(productId, quantity);
    await cart.populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name' }
    });

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/items/:productId - Видалити товар з кошика
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: 'Кошик не знайдено' });
    }

    await cart.removeItem(productId);
    await cart.populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name' }
    });

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart - Очистити кошик
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: 'Кошик не знайдено' });
    }

    await cart.clearCart();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/sync - Синхронізувати кошик з localStorage
export const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Невалідні дані кошика' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Мердж: додати/оновити товари з localStorage
    for (const guestItem of items) {
      const productId = guestItem.product._id || guestItem.product;
      
      const existingItem = cart.items.find(
        item => item.product.toString() === productId.toString()
      );

      if (existingItem) {
        // Товар вже є - сумуємо кількості
        existingItem.quantity += guestItem.quantity;
      } else {
        // Нового товару немає - додаємо
        cart.items.push({
          product: productId,
          quantity: guestItem.quantity
        });
      }
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name' }
    });

    res.json(cart);
  } catch (error) {
    next(error);
  }
};