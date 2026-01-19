import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Optional auth - не блокує якщо токен відсутній
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // Немає токена - продовжуємо як гість
      req.user = null;
      return next();
    }

    // Є токен - верифікуємо
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    // Токен невалідний - продовжуємо як гість
    req.user = null;
    next();
  }
};