import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// POST /api/orders - Створити замовлення
export const createOrder = async (req, res, next) => {
  try {
    const { items, guestInfo, comment } = req.body;
    const userId = req.user?._id || null;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Кошик порожній' });
    }

    // Розрахунок загальної суми
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData = {
      user: userId,
      items,
      totalAmount,
      comment: comment || '',
      status: 'new'
    };

    // Якщо гість - додати guestInfo
    if (!userId && guestInfo) {
      orderData.guestInfo = guestInfo;
    }

    const order = await Order.create(orderData);
    await order.populate('items.product');

    // Очистити кошик якщо користувач авторизований
    if (userId) {
      await Cart.findOneAndUpdate(
        { user: userId },
        { items: [] }
      );
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders - Отримати замовлення
export const getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const isAdmin = req.user.role === 'admin';

    const filter = { deletedAt: null };

    // Адмін бачить всі, користувач тільки свої
    if (!isAdmin) {
      // Користувач бачить:
      // 1. Замовлення де user === його ID
      // 2. Гостьові замовлення з його email (якщо він колись був гостем)
      filter.$or = [
        { user: req.user._id },
        { user: null, 'guestInfo.email': req.user.email }
      ];
    }

    // Фільтр по статусу
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product')
      .populate('user', 'email fullName')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id - Отримати замовлення за ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'email fullName');

    if (!order) {
      return res.status(404).json({ error: 'Замовлення не знайдено' });
    }

    // Перевірка доступу
    if (req.user) {
      // Авторизований користувач
      const isAdmin = req.user.role === 'admin';
      const isOwner = order.user && order.user._id.toString() === req.user._id.toString();

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Доступ заборонено' });
      }
    } else {
      // Гість - може переглядати тільки гостьові замовлення
      if (order.user !== null) {
        return res.status(403).json({ error: 'Доступ заборонено' });
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status - Оновити статус (Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['new', 'confirmed', 'assembled', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Невалідний статус' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Замовлення не знайдено' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/orders/:id - Soft delete (Admin)
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'deleted',
        deletedAt: new Date(),
        deletedBy: req.user._id
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Замовлення не знайдено' });
    }

    res.json({ message: 'Замовлення видалено', order });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};